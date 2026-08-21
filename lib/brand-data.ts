import { isSupabaseConfigured } from "@/lib/env";
import { getServerEnv, isSearchConfigured } from "@/lib/env/server";
import { createClient } from "@/lib/supabase/server";
import { SearchApiProvider } from "@/lib/providers/searchapi";

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
  previews: { id: string; url: string; type: string }[];
};

type BrandAdRow = {
  advertiser_name: string;
  advertiser_avatar_url: string | null;
  status: string;
  running_days: number | null;
  start_date: string | null;
  media_type: string;
  cta: string | null;
  platforms: string[] | null;
  canonical_ad_id: string;
  source_media_url: string | null;
  thumbnail_url: string | null;
};

export async function getBrandData(id: string): Promise<BrandData> {
  let rows: BrandAdRow[] = [];
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("ads")
      .select("advertiser_name,advertiser_avatar_url,status,running_days,start_date,media_type,cta,platforms,canonical_ad_id,source_media_url,thumbnail_url")
      .eq("advertiser_id", id)
      .limit(1500);
    rows = (data ?? []) as BrandAdRow[];
  }

  let name = rows[0]?.advertiser_name || `Meta advertiser ${id}`;
  let avatar = rows[0]?.advertiser_avatar_url || null;

  if (!rows.length && isSearchConfigured) {
    try {
      const advertiser = await new SearchApiProvider(getServerEnv().searchApiKeys).getAdvertiser(id);
      if (advertiser) {
        name = advertiser.name;
        avatar = advertiser.avatarUrl;
      }
    } catch {}
  }

  const uniqueAds = new Map<string, BrandAdRow>();
  for (const row of rows) {
    const existing = uniqueAds.get(row.canonical_ad_id);
    if (!existing || (row.status === "active" && existing.status !== "active")) {
      uniqueAds.set(row.canonical_ad_id, row);
    }
  }

  const distinctRows = Array.from(uniqueAds.values());
  const media = countBy(distinctRows.map((row) => row.media_type));
  const ctas = countBy(distinctRows.map((row) => row.cta).filter((cta): cta is string => Boolean(cta)));
  const platforms = countBy(distinctRows.flatMap((row) => row.platforms || []));

  const previews = distinctRows
    .filter(row => row.thumbnail_url || row.source_media_url)
    .slice(0, 10)
    .map(row => ({
      id: row.canonical_ad_id,
      url: (row.thumbnail_url || row.source_media_url) as string,
      type: row.media_type
    }));

  return {
    id,
    name,
    avatar,
    active: distinctRows.filter((r) => r.status === "active").length,
    inactive: distinctRows.filter((r) => r.status !== "active").length,
    total: distinctRows.length,
    longest: Math.max(0, ...distinctRows.map((r) => r.running_days || 0)),
    earliest: distinctRows.map((r) => r.start_date).filter((date): date is string => Boolean(date)).sort()[0] || null,
    media,
    ctas,
    platforms,
    previews,
  };
}

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

function countBy(items: string[]) {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});
}

export type CreativePreview = { id: string; url: string; type: string };

export type CompetitorSummary = {
  advertiserId: string;
  brandName: string;
  logoUrl: string | null;
  platforms: string[];
  category: string | null;
  activeAds: number;
  uniqueAds: number;
  newAdsThisWeek: number;
  stoppedAdsThisWeek: number;
  longestRunningDays: number | null;
  latestCreatives: CreativePreview[];
  trackedSince: string;
  lastActivityAt: string | null;
  lastSyncedAt: string | null;
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
  platforms: string[] | null;
  canonical_ad_id: string;
  source_media_url: string | null;
  thumbnail_url: string | null;
};

export async function getCompetitorSummaries(trackedRecords: TrackedRecord[]): Promise<CompetitorSummary[]> {
  if (!isSupabaseConfigured || !trackedRecords.length) return [];
  
  const supabase = await createClient();
  const advertiserIds = trackedRecords.map(r => r.advertiser_id);
  
  // Bulk fetch ads for all competitors
  const { data: adsData } = await supabase
    .from("ads")
    .select("advertiser_id, advertiser_name, advertiser_avatar_url, status, running_days, start_date, media_type, platforms, canonical_ad_id, source_media_url, thumbnail_url, end_date")
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
  
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const oneWeekAgoStr = oneWeekAgo.toISOString();
  
  return trackedRecords.map(record => {
    const id = record.advertiser_id;
    const advertiserAds = groupedAds.get(id) || [];
    
    // Identity resolution: prefer the record's stored name, then ad name, then fallback
    let brandName = record.advertiser_name;
    let logoUrl: string | null = record.advertiser_avatar_url || null;
    
    if (!brandName && advertiserAds.length > 0) {
      brandName = advertiserAds[0].advertiser_name;
      logoUrl = advertiserAds[0].advertiser_avatar_url || null;
    }
    
    if (!brandName) brandName = "Unknown Advertiser";
    
    // Deduplicate ads
    const uniqueAdsMap = new Map<string, BulkAdRow>();
    for (const ad of advertiserAds) {
      const existing = uniqueAdsMap.get(ad.canonical_ad_id);
      if (!existing || (ad.status === "active" && existing.status !== "active")) {
        uniqueAdsMap.set(ad.canonical_ad_id, ad);
      }
    }
    const distinctAds = Array.from(uniqueAdsMap.values());
    
    // Metrics
    const activeAdsCount = distinctAds.filter(a => a.status === "active").length;
    const uniqueAdsCount = distinctAds.length;
    
    const newAdsThisWeek = distinctAds.filter(a => a.start_date && a.start_date >= oneWeekAgoStr).length;
    const stoppedAdsThisWeek = distinctAds.filter(a => a.status !== "active" && a.end_date && a.end_date >= oneWeekAgoStr).length;
    
    const longest = Math.max(0, ...distinctAds.map(a => a.running_days || 0));
    
    const platformsSet = new Set<string>();
    distinctAds.forEach(a => {
      if (a.platforms) a.platforms.forEach((p: string) => platformsSet.add(p));
    });
    
    const latestCreatives = distinctAds
      .filter(a => a.thumbnail_url || a.source_media_url)
      .slice(0, 3)
      .map(a => ({
        id: a.canonical_ad_id,
        url: (a.thumbnail_url || a.source_media_url) as string,
        type: a.media_type
      }));
      
    // Activity timestamps
    let lastActivityAt = null;
    if (distinctAds.length > 0) {
      // Find the most recent start_date
      const dates = distinctAds.map(a => a.start_date).filter(Boolean).sort().reverse();
      if (dates.length > 0) lastActivityAt = dates[0];
    }
      
    return {
      advertiserId: id,
      brandName,
      logoUrl,
      platforms: Array.from(platformsSet),
      category: null,
      activeAds: activeAdsCount,
      uniqueAds: uniqueAdsCount,
      newAdsThisWeek,
      stoppedAdsThisWeek,
      longestRunningDays: longest > 0 ? longest : null,
      latestCreatives,
      trackedSince: record.created_at,
      lastActivityAt,
      lastSyncedAt: null // We'll assume real-time fetch isn't synced separately for now
    };
  });
}

