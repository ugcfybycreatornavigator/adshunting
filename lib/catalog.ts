import type { AdStatus, MediaType, NormalizedAd } from "@/lib/types";
import { computeAdIntelligence } from "@/lib/intelligence";
import { normalizeSearchApiAd } from "@/lib/providers/searchapi";

export interface DatabaseAdRow {
  id: string;
  external_ad_id: string;
  canonical_ad_id?: string;
  creative_fingerprint?: string;
  creative_group_id?: string;
  observation_count?: number;
  provider_ad_ids?: string[];
  missing_checks?: number;
  variant_key?: string;
  advertiser_id: string;
  advertiser_name: string;
  advertiser_avatar_url: string | null;
  advertiser_profile_url: string | null;
  body: string | null;
  caption?: string | null;
  headline: string | null;
  description: string | null;
  hashtags?: string[] | null;
  cta: string | null;
  landing_page_url: string | null;
  source_media_url: string | null;
  thumbnail_url: string | null;
  carousel_assets?: string[] | null;
  stored_media_path: string | null;
  archive_status?: "not_requested" | "archived" | "failed" | "unavailable" | null;
  media_type: MediaType;
  status: AdStatus;
  start_date: string | null;
  stop_date: string | null;
  first_seen_at: string;
  last_seen_at: string;
  running_days: number | null;
  country: string | null;
  platforms: string[] | null;
  demographics?: Record<string, Record<string, number>> | null;
  snapshot_url: string | null;
  source: "searchapi" | "meta" | "foreplay" | "catalog";
  raw_data: Record<string, unknown> | null;
}

export function dbAdToNormalized(row: DatabaseAdRow): NormalizedAd {
  if (row.source === "searchapi" && row.raw_data && Object.keys(row.raw_data).length > 0) {
    try {
      const renorm = normalizeSearchApiAd(row.raw_data, row.country || undefined);
      // Overlay the latest state from the database record
      return {
        ...renorm,
        id: row.id,
        status: row.status,
        lastSeenAt: row.last_seen_at,
        runningDays: row.running_days == null ? null : Number(row.running_days),
        storedMediaPath: row.stored_media_path,
        archiveStatus: row.archive_status ?? (row.stored_media_path ? "archived" : "not_requested"),
        canonicalAdId: row.canonical_ad_id || renorm.canonicalAdId,
        creativeFingerprint: row.creative_fingerprint || renorm.creativeFingerprint,
        creativeGroupId: row.creative_group_id || renorm.creativeGroupId,
        observationCount: row.observation_count ?? 1,
        providerAdIds: row.provider_ad_ids || [row.external_ad_id],
      };
    } catch (err) {
      console.error("[AdsHunting dbAdToNormalized] Re-normalization failed, falling back to DB columns", err);
    }
  }

  const variants = Number(row.raw_data?.collation_count || 1);
  const repetition = Math.max(0, variants - 1);
  const runningDays = row.running_days == null ? null : Number(row.running_days);

  const intelligence = computeAdIntelligence({
    startDate: row.start_date,
    stopDate: row.stop_date,
    status: row.status,
    lastSeenAt: row.last_seen_at,
    variants,
    creativeRepetition: repetition,
    platforms: row.platforms ?? [],
    mediaType: row.media_type,
    headline: row.headline,
    body: row.body,
    cta: row.cta,
    landingPageUrl: row.landing_page_url,
    sourceMediaUrl: row.source_media_url,
    advertiserId: row.advertiser_id,
  });

  return {
    id: row.id,
    externalAdId: row.external_ad_id,
    advertiserId: row.advertiser_id,
    advertiserName: row.advertiser_name,
    advertiserAvatarUrl: row.advertiser_avatar_url,
    advertiserProfileUrl: row.advertiser_profile_url,
    body: row.body,
    caption: row.caption ?? row.body,
    headline: row.headline,
    description: row.description,
    hashtags: row.hashtags ?? [],
    cta: row.cta,
    landingPageUrl: row.landing_page_url,
    sourceMediaUrl: row.source_media_url,
    thumbnailUrl: row.thumbnail_url,
    carouselAssets: row.carousel_assets ?? [],
    storedMediaPath: row.stored_media_path,
    archiveStatus: row.archive_status ?? (row.stored_media_path ? "archived" : "not_requested"),
    mediaType: row.media_type,
    status: row.status,
    startDate: row.start_date,
    stopDate: row.stop_date,
    firstSeenAt: row.first_seen_at,
    lastSeenAt: row.last_seen_at,
    runningDays,
    country: row.country,
    platforms: row.platforms ?? [],
    demographics: row.demographics ?? null,
    snapshotUrl: row.snapshot_url,
    source: "catalog",
    variants,
    creativeRepetition: repetition,
    brandActiveAds: null,
    winnerScore: intelligence.adjustedWinnerScore,
    intelligenceLabels: [intelligence.badgeCategory, intelligence.longevityLabel.split(" ")[0]],
    canonicalAdId: row.canonical_ad_id || row.id,
    creativeFingerprint: row.creative_fingerprint || "",
    creativeGroupId: row.creative_group_id || "",
    observationCount: row.observation_count ?? 1,
    providerAdIds: row.provider_ad_ids || [row.external_ad_id],
    rawData: row.raw_data ?? undefined,
  };
}

export function normalizedToDb(ad: NormalizedAd): Omit<DatabaseAdRow, "created_at" | "updated_at"> {
  return {
    id: ad.id,
    external_ad_id: ad.externalAdId,
    canonical_ad_id: ad.canonicalAdId,
    creative_fingerprint: ad.creativeFingerprint,
    creative_group_id: ad.creativeGroupId,
    observation_count: ad.observationCount || 1,
    provider_ad_ids: ad.providerAdIds || [ad.externalAdId],
    advertiser_id: ad.advertiserId,
    advertiser_name: ad.advertiserName,
    advertiser_avatar_url: ad.advertiserAvatarUrl,
    advertiser_profile_url: ad.advertiserProfileUrl,
    body: ad.body,
    caption: ad.caption,
    headline: ad.headline,
    description: ad.description,
    hashtags: ad.hashtags,
    cta: ad.cta,
    landing_page_url: ad.landingPageUrl,
    source_media_url: ad.sourceMediaUrl,
    thumbnail_url: ad.thumbnailUrl,
    carousel_assets: ad.carouselAssets,
    media_type: ad.mediaType,
    status: ad.status,
    start_date: ad.startDate,
    stop_date: ad.stopDate,
    first_seen_at: ad.firstSeenAt || new Date().toISOString(),
    last_seen_at: new Date().toISOString(),
    stored_media_path: ad.storedMediaPath,
    archive_status: ad.archiveStatus,
    missing_checks: 0,
    running_days: ad.runningDays,
    country: ad.country,
    platforms: ad.platforms.length > 0 ? ad.platforms : null,
    demographics: ad.demographics as unknown as Record<string, Record<string, number>>,
    snapshot_url: ad.snapshotUrl,
    source: ad.source,
    variant_key: `${ad.advertiserId}:${ad.headline || ""}:${ad.mediaType}`.slice(0, 500),
    raw_data: ad.rawData || null,
  };
}
