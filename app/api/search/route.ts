import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/env";
import { isAnyAdsProviderConfigured } from "@/lib/env/server";
import { rateLimit } from "@/lib/rate-limit";
import { dbAdToNormalized } from "@/lib/catalog";
import { requireUser } from "@/lib/auth";
import { getAdProviders, setProviderHealth, clearProviderCircuit } from "@/lib/providers";
import { ProviderError } from "@/lib/providers/errors";
import { adsForClient, persistNormalizedAds } from "@/lib/ads-persistence";
import { isPreviewMode } from "@/lib/preview";
import type { AdSearchFilters, AdSearchResult, NormalizedAd } from "@/lib/types";

const schema = z.object({
  query: z.string().trim().max(160).optional(),
  status: z.enum(["all", "active", "inactive"]).default("all"),
  country: z.string().max(8).optional(),
  platforms: z.array(z.enum(["facebook", "instagram", "messenger", "audience_network", "threads"])).max(5).optional(),
  mediaType: z.enum(["all", "image", "video", "carousel", "unknown"]).optional(),
  cta: z.string().max(40).optional(),
  duration: z.string().max(20).optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  brand: z.string().max(80).optional(),
  language: z.string().max(16).optional(),
  sort: z.string().max(32).optional(),
  cursor: z.string().max(16_000).optional(),
});

type CacheEntry = { expires: number; payload: unknown };
const cache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<AdSearchResult>>();

export async function POST(request: NextRequest) {
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

  const filters = parsed.data;
  const key = JSON.stringify(filters);
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) {
    return NextResponse.json(hit.payload, { headers: { "X-Cache": "HIT" } });
  }

  try {
    let payload: AdSearchResult | null = null;

    // 1. Check Supabase preload/cache first if query is empty or requesting discovery feed
    if (isSupabaseConfigured && (!filters.query || !filters.query.trim()) && !filters.brand && !filters.cursor) {
      try {
        const { data: cachedRows } = await catalogClient!
          .from("ads")
          .select("*")
          .order("last_seen_at", { ascending: false })
          .limit(120);

        if (cachedRows) {
          const ads = rankDiscoveryFeed(applyCatalogFilters(cachedRows.map(dbAdToNormalized), filters)).slice(0, 30);
          if (ads.length >= 6) {
          payload = { ads: adsForClient(ads), nextCursor: null, total: ads.length, source: "catalog" };
          }
        }
      } catch {}
    }

    // 2. Call provider if not satisfied by preloaded cache
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

function applyCatalogFilters(ads: NormalizedAd[], filters: AdSearchFilters) {
  return ads.filter((ad) => {
    if (filters.status && filters.status !== "all" && ad.status !== filters.status) return false;
    if (filters.mediaType && filters.mediaType !== "all" && ad.mediaType !== filters.mediaType) return false;
    if (filters.country && filters.country !== "ALL" && ad.country !== filters.country) return false;
    if (filters.platforms?.length && !filters.platforms.some((platform) => ad.platforms.includes(platform))) return false;
    if (filters.cta && ad.cta?.toLowerCase() !== filters.cta.toLowerCase()) return false;
    return true;
  });
}

function rankDiscoveryFeed(ads: NormalizedAd[]) {
  const ranked = [...ads].sort((a, b) => {
    const aScore = a.winnerScore + (a.status === "active" ? 10 : 0) + Math.min(a.runningDays || 0, 120) / 6 + Math.min(a.variants, 10) * 2;
    const bScore = b.winnerScore + (b.status === "active" ? 10 : 0) + Math.min(b.runningDays || 0, 120) / 6 + Math.min(b.variants, 10) * 2;
    return bScore - aScore;
  });
  const advertiserCounts = new Map<string, number>();
  return ranked.sort((a, b) => (advertiserCounts.get(a.advertiserId) || 0) - (advertiserCounts.get(b.advertiserId) || 0)).filter((ad) => {
    const count = advertiserCounts.get(ad.advertiserId) || 0;
    if (count >= 3) return false;
    advertiserCounts.set(ad.advertiserId, count + 1);
    return true;
  });
}
