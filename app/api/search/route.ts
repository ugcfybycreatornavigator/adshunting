import { NextRequest, NextResponse, after } from "next/server";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/env";
import { isAnyAdsProviderConfigured } from "@/lib/env/server";
import { rateLimit } from "@/lib/rate-limit";
import { dbAdToNormalized } from "@/lib/catalog";
import { requireUser } from "@/lib/auth";
import { requirePaidWorkspaceAccess } from "@/lib/billing/entitlement";
import { getAdProviders, setProviderHealth, clearProviderCircuit } from "@/lib/providers";
import { ProviderError } from "@/lib/providers/errors";
import { adsForClient, persistNormalizedAds, archiveAdsInBackground } from "@/lib/ads-persistence";
import { isPreviewMode } from "@/lib/preview";
import type { AdSearchResult, NormalizedAd } from "@/lib/types";
import { normalizeDiscoverFilters } from "@/lib/filter-utils";

const schema = z.object({
  query: z.string().trim().max(160).optional(),
  brand: z.string().max(80).optional(),
  platforms: z.array(z.enum(["facebook", "instagram", "messenger", "audience_network", "threads"])).max(5).optional(),
  sort: z.string().max(32).optional(),
  cursor: z.string().max(16_000).optional(),
  cta: z.string().max(40).optional(),

  // Legacy singular
  status: z.enum(["all", "active", "inactive"]).default("all"),
  country: z.string().max(8).optional(),
  mediaType: z.enum(["all", "image", "video", "carousel", "unknown"]).optional(),
  language: z.string().max(16).optional(),
  duration: z.string().max(20).optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),

  // New plural
  formats: z.array(z.enum(["image", "video", "carousel", "unknown"])).optional(),
  statuses: z.array(z.enum(["active", "inactive", "unknown"])).optional(),
  markets: z.array(z.string().max(8)).optional(),
  languages: z.array(z.string().max(16)).optional(),
  niches: z.array(z.string().max(32)).optional(),
  contentStyles: z.array(z.string().max(32)).optional(),
  
  runtime: z.object({
    preset: z.string().optional(),
    minDays: z.number().nonnegative().optional(),
    maxDays: z.number().nonnegative().optional(),
  }).optional(),
  
  videoLength: z.object({
    preset: z.string().optional(),
    minSeconds: z.number().nonnegative().optional(),
    maxSeconds: z.number().nonnegative().optional(),
  }).optional(),
});

type CacheEntry = { expires: number; payload: unknown };
const cache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<AdSearchResult>>();

export async function POST(request: NextRequest) {
  const accessError = await requirePaidWorkspaceAccess();
  if (accessError) return accessError;

  let catalogClient: Awaited<ReturnType<typeof requireUser>>["supabase"] = null;
  if (isSupabaseConfigured && !isPreviewMode) {
    const auth = await requireUser();
    if (auth.error) return auth.error;
    catalogClient = auth.supabase;
  } else if (isSupabaseConfigured && isPreviewMode) {
    const auth = await requireUser();
    if (auth.error) return auth.error;
    catalogClient = auth.supabase;
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  const limit = rateLimit(`search:${ip}`, 40);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many searches. Please wait a moment.", code: "RATE_LIMITED" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const rawBody = await request.json().catch(() => ({}));
  const cleanBody = Object.fromEntries(
    Object.entries(rawBody).filter(
      ([, v]) => v !== "" && v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0)
    )
  );

  const parsed = schema.safeParse(cleanBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid search filters.", code: "INVALID_FILTERS", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const filters = normalizeDiscoverFilters(parsed.data);
  
  // Sort array fields for stable cache key
  const normalizedFilters = { ...filters };
  if (normalizedFilters.platforms) normalizedFilters.platforms.sort();
  if (normalizedFilters.formats) normalizedFilters.formats.sort();
  if (normalizedFilters.statuses) normalizedFilters.statuses.sort();
  if (normalizedFilters.markets) normalizedFilters.markets.sort();
  if (normalizedFilters.languages) normalizedFilters.languages.sort();
  if (normalizedFilters.niches) normalizedFilters.niches.sort();
  if (normalizedFilters.contentStyles) normalizedFilters.contentStyles.sort();
  
  const key = JSON.stringify(normalizedFilters);
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) {
    return NextResponse.json(hit.payload, { headers: { "X-Cache": "HIT" } });
  }

  try {
    let payload: AdSearchResult | null = null;

    // 1. Check Supabase preload/cache first if query is empty or requesting discovery feed
    if (isSupabaseConfigured && (!filters.query || !filters.query.trim()) && !filters.brand) {
      try {
        let query = catalogClient!.from("ads").select("*", { count: "exact" });
        
        // Apply Plural filters
        if (filters.formats?.length) query = query.in("media_type", filters.formats);
        if (filters.statuses?.length) query = query.in("status", filters.statuses);
        if (filters.markets?.length) query = query.in("country", filters.markets);
        if (filters.platforms?.length) query = query.contains("platforms", filters.platforms);
        
        // Legacy singular filters
        if (filters.status && filters.status !== "all" && !filters.statuses?.length) query = query.eq("status", filters.status);
        if (filters.mediaType && filters.mediaType !== "all" && !filters.formats?.length) query = query.eq("media_type", filters.mediaType);
        if (filters.country && filters.country !== "ALL" && !filters.markets?.length) query = query.eq("country", filters.country);
        if (filters.cta) query = query.ilike("cta", `%${filters.cta}%`);

        if (filters.runtime) {
          if (filters.runtime.minDays !== undefined) query = query.gte("running_days", filters.runtime.minDays);
          if (filters.runtime.maxDays !== undefined) query = query.lte("running_days", filters.runtime.maxDays);
        }
        
        // Fetch a large pool to allow in-memory diversity ranking before pagination
        query = query.limit(1000);

        // Apply sort
        if (filters.sort === "newest") {
          query = query.order("start_date", { ascending: false, nullsFirst: false });
        } else if (filters.sort === "oldest") {
          query = query.order("start_date", { ascending: true, nullsFirst: false });
        } else if (filters.sort === "longest") {
          query = query.order("running_days", { ascending: false, nullsFirst: false });
        } else {
          query = query.order("last_seen_at", { ascending: false });
        }

        const { data, error } = await query;

        if (!error && data) {
          const ads = data.map(dbAdToNormalized);
          let ranked = ads;
          const hasActiveFilters = Object.keys(filters).some(k => 
            !['cursor', 'sort', 'query'].includes(k) && 
            filters[k as keyof typeof filters] !== undefined && 
            (Array.isArray(filters[k as keyof typeof filters]) ? (filters[k as keyof typeof filters] as unknown[]).length > 0 : true)
          );
          
          if (!filters.sort || filters.sort === "relevant") {
            ranked = rankDiscoveryFeed(ads, !hasActiveFilters && !filters.query);
          } else if (filters.sort === "newest") {
            ranked.sort((a, b) => new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime());
          } else if (filters.sort === "oldest") {
            ranked.sort((a, b) => new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime());
          } else if (filters.sort === "longest") {
            ranked.sort((a, b) => (b.runningDays || 0) - (a.runningDays || 0));
          } else if (filters.sort === "variations") {
            ranked.sort((a, b) => b.variants - a.variants);
          }
          
          // Deduplicate into variant groups (pick representative)
          const variantGroups = new Map<string, NormalizedAd>();
          for (const ad of ranked) {
            const groupId = ad.creativeGroupId || ad.id;
            if (!variantGroups.has(groupId)) {
              variantGroups.set(groupId, ad);
            } else {
              // Track variants count on the representative (for UI display)
              const rep = variantGroups.get(groupId)!;
              rep.variants = (rep.variants || 1) + 1; 
            }
          }
          
          const deduplicatedRanked = Array.from(variantGroups.values());
          
          // Now apply pagination
          const limit = 25;
          const offset = filters.cursor ? parseInt(filters.cursor, 10) : 0;
          const paged = deduplicatedRanked.slice(offset, offset + limit);
          
          const nextOffset = offset + limit;
          const nextCursor = nextOffset < deduplicatedRanked.length ? nextOffset.toString() : null;
          
          payload = { 
            ads: adsForClient(paged), 
            nextCursor, 
            total: deduplicatedRanked.length, 
            source: "catalog" 
          };
        }
      } catch (err) {
        console.error("[DiscoverAds] Supabase error:", err);
      }
    }

    // 2. Call provider if not satisfied by preloaded cache (e.g. we have a search query)
    if (!payload && isAnyAdsProviderConfigured) {
      let providers;
      try {
        providers = getAdProviders(filters);
      } catch (err) {
        if (err instanceof ProviderError && (err.code === "META_TOKEN_EXPIRED" || err.code === "PROVIDER_AUTH")) {
          // If Meta token expired and no other provider is configured, check Supabase fallback
          if (isSupabaseConfigured) {
            const { data } = await catalogClient!.from("ads").select("*").order("last_seen_at", { ascending: false }).limit(24);
            if (data && data.length) {
              payload = { ads: adsForClient(data.map(dbAdToNormalized)), nextCursor: null, total: data.length, source: "catalog" };
            }
          }
        }
        if (!payload) throw err;
      }

      if (!payload && providers) {
        let result: AdSearchResult | null = null;
        let lastError: ProviderError | null = null;

        for (const { provider, name } of providers) {
          try {
            const requestKey = `${name}:${key}`;
            let pending = inFlight.get(requestKey);
            if (!pending) {
              pending = provider.searchAds(filters).finally(() => inFlight.delete(requestKey));
              inFlight.set(requestKey, pending);
            }
            result = await pending;
            clearProviderCircuit(name);
            setProviderHealth(name, "CONNECTED");
            break;
          } catch (error) {
            if (!(error instanceof ProviderError)) throw error;
            lastError = error;

            if (error.code === "META_TOKEN_EXPIRED") {
              setProviderHealth(name, "TOKEN_EXPIRED", error.message);
            } else if (error.code === "META_PERMISSION_ERROR") {
              setProviderHealth(name, "PERMISSION_REQUIRED", error.message);
            } else if (error.code === "PROVIDER_AUTH" || error.code === "SEARCHAPI_AUTH_ERROR" || error.code === "FOREPLAY_AUTH_ERROR") {
              setProviderHealth(name, "AUTH_ERROR", error.message);
            } else if (["PROVIDER_RATE_LIMIT", "META_RATE_LIMIT", "SEARCHAPI_RATE_LIMIT", "FOREPLAY_RATE_LIMIT", "FOREPLAY_QUOTA_EXCEEDED"].includes(error.code)) {
              setProviderHealth(name, "RATE_LIMITED", error.message);
            } else {
              setProviderHealth(name, "UNAVAILABLE", error.message);
            }

            if (providers.length === 1) break;
          }
        }

        if (result) {
          await persistNormalizedAds(result.ads);
          const adsToArchive = result.ads;
          after(() => {
            archiveAdsInBackground(adsToArchive).catch(console.error);
          });
          payload = { ...result, ads: adsForClient(result.ads) };
        } else if (isSupabaseConfigured) {
          // Fallback to Supabase stored ads on total provider failure
          const { data } = await catalogClient!.from("ads").select("*").order("last_seen_at", { ascending: false }).limit(24);
          if (data && data.length) {
            payload = { ads: adsForClient(data.map(dbAdToNormalized)), nextCursor: null, total: data.length, source: "catalog" };
          } else if (lastError) {
            throw lastError;
          }
        } else if (lastError) {
          throw lastError;
        }
      }
    }

    if (!payload) {
      return NextResponse.json({ error: "No ads available.", code: "NOT_CONFIGURED" }, { status: 503 });
    }

    cache.set(key, { expires: Date.now() + 5 * 60_000, payload });
    if (cache.size > 200) cache.delete(cache.keys().next().value as string);
    return NextResponse.json(payload, { headers: { "Cache-Control": "private, max-age=60" } });
  } catch (error) {
    if (error instanceof ProviderError) {
      return NextResponse.json({ success: false, code: error.code, message: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { success: false, code: "SEARCH_UNAVAILABLE", message: "Search is temporarily unavailable." },
      { status: 502 }
    );
  }
}


function rankDiscoveryFeed(ads: NormalizedAd[], applyDiversityLimit: boolean) {
  const ranked = [...ads].sort((a, b) => {
    // Relevance score proxies
    const aScore = a.winnerScore + (a.status === "active" ? 10 : 0) + Math.min(a.runningDays || 0, 120) / 6 + Math.min(a.variants, 10) * 2;
    const bScore = b.winnerScore + (b.status === "active" ? 10 : 0) + Math.min(b.runningDays || 0, 120) / 6 + Math.min(b.variants, 10) * 2;
    return bScore - aScore;
  });
  
  if (!applyDiversityLimit) return ranked;

  const advertiserCounts = new Map<string, number>();
  return ranked.filter((ad) => {
    // We group by advertiser ID to ensure diversity
    
    // We also roughly check for Frido domain variations so Frido doesn't bypass the limit using 5 different IDs
    const isFrido = ad.advertiserName.toLowerCase().includes("frido");
    const key = isFrido ? "global_frido_group" : ad.advertiserId;
    
    const currentCount = advertiserCounts.get(key) || 0;
    if (currentCount >= 3) return false;
    
    advertiserCounts.set(key, currentCount + 1);
    return true;
  });
}
