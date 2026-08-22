import { isSupabaseConfigured } from "@/lib/env";
import { getServerEnv, isSearchConfigured } from "@/lib/env/server";
import { createClient } from "@/lib/supabase/server";
import { SearchApiProvider } from "@/lib/providers/searchapi";
import { persistNormalizedAds } from "@/lib/ads-persistence";

export type CreativePreview = { id: string; url: string; type: string };

export type CompetitorIntelligence = {
  advertiserId: string;
  brandName: string;
  logoUrl: string | null;
  platforms: string[];
  category: string | null;
  activeAds: number;
  uniqueAds: number;
  totalAds: number;
  newAdsThisWeek: number;
  stoppedAdsThisWeek: number;
  longestRunningDays: number | null;
  averageRunningDays: number | null;
  latestCreatives: CreativePreview[];
  trackedSince: string | null;
  lastActivityAt: string | null;
  firstSeenAt: string | null;
  lastSyncedAt: string | null;

  // Analytics properties
  mediaDistribution: Record<string, number>;
  ctaDistribution: Record<string, number>;
};

export type TrackedRecord = {
  advertiser_id: string;
  advertiser_name?: string;
  advertiser_avatar_url?: string | null;
  created_at: string;
};

type BulkAdRow = {
  advertiser_id: string;
  advertiser_name: string;
  advertiser_avatar_url: string | null;
  status: string;
  running_days: number | null;
  start_date: string | null;
  end_date: string | null;
  media_type: string;
  cta?: string | null;
  platforms: string[] | null;
  canonical_ad_id: string;
  source_media_url: string | null;
  thumbnail_url: string | null;
};

/**
 * Triggers an immediate API sync for the given competitor's ads and saves them to the DB.
 */
export async function syncCompetitorAds(advertiserId: string): Promise<boolean> {
  if (!isSearchConfigured) return false;
  try {
    const searchApi = new SearchApiProvider(getServerEnv().searchApiKeys);
    // 1. Fetch advertiser details to ensure name is updated if not passed
    const advertiser = await searchApi.getAdvertiser(advertiserId).catch(() => null);

    // 2. Fetch all current ads
    const result = await searchApi.searchAds({ brand: advertiserId, status: "all" });

    if (result.ads.length > 0) {
      if (advertiser) {
        // Enforce the canonical name on the normalized ads so persistence gets it right
        for (const ad of result.ads) {
          ad.advertiserName = advertiser.name;
          if (advertiser.avatarUrl) ad.advertiserAvatarUrl = advertiser.avatarUrl;
        }
      }
      await persistNormalizedAds(result.ads);
    }
    return true;
  } catch (error) {
    console.error(`[syncCompetitorAds] Error syncing ads for ${advertiserId}`, error);
    return false;
  }
}

/**
 * Core normalization logic to convert a raw list of ads into intelligence metrics.
 * This is the SINGLE canonical source for calculating competitor stats.
 */
function buildCompetitorIntelligence(
  advertiserId: string,
  ads: BulkAdRow[],
  trackedRecord?: Partial<TrackedRecord> | null
): CompetitorIntelligence {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const oneWeekAgoStr = oneWeekAgo.toISOString();

  // Identity Resolution Priority: 
  // 1. Tracked competitor DB record (if exists)
  // 2. The first ad's advertiser name
  // 3. Fallback to Meta advertiser ID
  let brandName = trackedRecord?.advertiser_name;
  let logoUrl = trackedRecord?.advertiser_avatar_url || null;

  if (!brandName && ads.length > 0) {
    brandName = ads[0].advertiser_name;
    logoUrl = ads[0].advertiser_avatar_url || null;
  }

  if (!brandName || brandName.trim() === "") {
    brandName = `Meta advertiser ${advertiserId}`;
  }

  // Deduplicate Ads by canonical ID
  const uniqueAdsMap = new Map<string, BulkAdRow>();
  for (const ad of ads) {
    const existing = uniqueAdsMap.get(ad.canonical_ad_id);
    // Prefer the active state if there's a conflict
    if (!existing || (ad.status === "active" && existing.status !== "active")) {
      uniqueAdsMap.set(ad.canonical_ad_id, ad);
    }
  }
  const distinctAds = Array.from(uniqueAdsMap.values());

  // Counts
  const activeAdsCount = distinctAds.filter(a => a.status === "active").length;
  const uniqueAdsCount = distinctAds.length;
  const totalAds = ads.length;

  // Trends
  const newAdsThisWeek = distinctAds.filter(a => a.start_date && a.start_date >= oneWeekAgoStr).length;
  const stoppedAdsThisWeek = distinctAds.filter(a => a.status !== "active" && a.end_date && a.end_date >= oneWeekAgoStr).length;

  // Durations
  const activeDays = distinctAds.map(a => a.running_days).filter((d): d is number => typeof d === "number" && d > 0);
  const longest = activeDays.length > 0 ? Math.max(...activeDays) : null;
  const average = activeDays.length > 0 ? Math.round(activeDays.reduce((sum, d) => sum + d, 0) / activeDays.length) : null;

  // Platforms Set
  const platformsSet = new Set<string>();
  distinctAds.forEach(a => {
    if (a.platforms) a.platforms.forEach((p: string) => platformsSet.add(p));
  });

  // Previews
  const latestCreatives = distinctAds
    .filter(a => a.thumbnail_url || a.source_media_url)
    .slice(0, 10)
    .map(a => ({
      id: a.canonical_ad_id,
      url: (a.thumbnail_url || a.source_media_url) as string,
      type: a.media_type
    }));

  // Dates
  const allStartDates = distinctAds.map(a => a.start_date).filter((d): d is string => Boolean(d)).sort();
  const firstSeenAt = allStartDates.length > 0 ? allStartDates[0] : null;
  const lastActivityAt = allStartDates.length > 0 ? allStartDates[allStartDates.length - 1] : null;

  // Analytics Distributions
  const mediaDistribution = countBy(distinctAds.map(row => row.media_type));
  const ctaDistribution = countBy(distinctAds.map(row => row.cta).filter((cta): cta is string => Boolean(cta)));

  return {
    advertiserId,
    brandName,
    logoUrl,
    platforms: Array.from(platformsSet),
    category: null,
    activeAds: activeAdsCount,
    uniqueAds: uniqueAdsCount,
    totalAds,
    newAdsThisWeek,
    stoppedAdsThisWeek,
    longestRunningDays: longest,
    averageRunningDays: average,
    latestCreatives,
    trackedSince: trackedRecord?.created_at || null,
    lastActivityAt,
    firstSeenAt,
    lastSyncedAt: null, // Would be fetched from a sync_logs table if implemented
    mediaDistribution,
    ctaDistribution,
  };
}

/**
 * Gets the intelligence for a single competitor (Intelligence Page).
 * Safely handles syncing if no data exists.
 */
export async function getCompetitorIntelligence(id: string, allowSync = true): Promise<CompetitorIntelligence> {
  const supabase = await createClient();

  const fetchAds = async () => {
    const { data } = await supabase
      .from("ads")
      .select("advertiser_id, advertiser_name, advertiser_avatar_url, status, running_days, start_date, media_type, cta, platforms, canonical_ad_id, source_media_url, thumbnail_url, end_date")
      .eq("advertiser_id", id)
      .order("start_date", { ascending: false });
    return (data || []) as BulkAdRow[];
  };

  let ads = await fetchAds();

  // If no ads exist, trigger an inline sync and refetch (only if allowed)
  if (ads.length === 0 && allowSync) {
    const synced = await syncCompetitorAds(id);
    if (synced) {
      ads = await fetchAds();
    }
  }

  // Attempt to fetch the tracked competitor record for custom name overriding
  const { data: competitorRecord } = await supabase
    .from("competitors")
    .select("advertiser_name, advertiser_avatar_url, created_at")
    .eq("advertiser_id", id)
    .maybeSingle();

  // If there are still no ads AND we didn't have a tracked record, try to fetch fallback advertiser details from SearchApi
  // so the intelligence page doesn't just say "Meta advertiser 123"
  let fallbackRecord = competitorRecord;
  if (ads.length === 0 && !fallbackRecord && isSearchConfigured) {
    try {
      const searchApi = new SearchApiProvider(getServerEnv().searchApiKeys);
      const adv = await searchApi.getAdvertiser(id);
      if (adv) {
        fallbackRecord = {
          advertiser_name: adv.name,
          advertiser_avatar_url: adv.avatarUrl,
          created_at: new Date().toISOString()
        };
      }
    } catch { }
  }

  return buildCompetitorIntelligence(id, ads, fallbackRecord);
}

/**
 * Bulk fetches intelligence for the competitor cards list.
 */
export async function getCompetitorSummaries(trackedRecords: TrackedRecord[]): Promise<CompetitorIntelligence[]> {
  if (!isSupabaseConfigured || !trackedRecords.length) return [];

  const supabase = await createClient();
  const advertiserIds = trackedRecords.map(r => r.advertiser_id);

  const { data: adsData } = await supabase
    .from("ads")
    .select("advertiser_id, advertiser_name, advertiser_avatar_url, status, running_days, start_date, media_type, cta, platforms, canonical_ad_id, source_media_url, thumbnail_url, end_date")
    .in("advertiser_id", advertiserIds)
    .order("start_date", { ascending: false });

  const rows = (adsData || []) as BulkAdRow[];

  // Group by advertiser_id
  const groupedAds = new Map<string, BulkAdRow[]>();
  for (const row of rows) {
    if (!groupedAds.has(row.advertiser_id)) {
      groupedAds.set(row.advertiser_id, []);
    }
    groupedAds.get(row.advertiser_id)!.push(row);
  }

  return trackedRecords.map(record => {
    const id = record.advertiser_id;
    const advertiserAds = groupedAds.get(id) || [];
    return buildCompetitorIntelligence(id, advertiserAds, record);
  });
}

function countBy(items: string[]) {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});
}

// BACKWARD COMPATIBILITY for Analytics and brand directory

export type BrandData = {
  id: string;
  name: string;
  avatar: string | null;
  active: number;
  inactive: number;
  total: number;
  longest: number;
  earliest: string | null;
  media: Record<string, number>;
  ctas: Record<string, number>;
  platforms: Record<string, number>;
  previews: CreativePreview[];
};

export type BrandSummary = {
  id: string;
  name: string;
  avatar: string | null;
  platforms: string[];
  totalUnique: number;
  activeUnique: number;
  previewMedia: string[];
  previewThumbs: string[];
};

export async function getBrands(query?: string): Promise<BrandSummary[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("search_brands", {
    query_text: query?.trim() || null,
    max_results: 40
  });

  if (error || !data) {
    return [];
  }

  return data.map((row: Record<string, unknown>) => ({
    id: row.advertiser_id as string,
    name: row.advertiser_name as string,
    avatar: row.advertiser_avatar_url as string | null,
    platforms: (row.platforms as string[]) || [],
    totalUnique: Number(row.unique_ads) || 0,
    activeUnique: Number(row.active_ads) || 0,
    previewMedia: (row.preview_media as string[]) || [],
    previewThumbs: (row.preview_thumbs as string[]) || []
  }));
}

export async function getBrandData(id: string): Promise<BrandData> {
  const intel = await getCompetitorIntelligence(id, false);
  return {
    id: intel.advertiserId,
    name: intel.brandName,
    avatar: intel.logoUrl,
    active: intel.activeAds,
    inactive: intel.uniqueAds - intel.activeAds,
    total: intel.uniqueAds,
    longest: intel.longestRunningDays || 0,
    earliest: intel.firstSeenAt,
    media: intel.mediaDistribution,
    ctas: intel.ctaDistribution,
    platforms: intel.platforms.reduce((acc, p) => ({ ...acc, [p]: 1 }), {}),
    previews: intel.latestCreatives
  };
}
