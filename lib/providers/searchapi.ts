import type { AdProvider, AdSearchFilters, AdSearchResult, Advertiser, MediaType, NormalizedAd, ProviderCapabilities } from "@/lib/types";
import { daysBetween, safeExternalUrl, sanitizeAdCopy } from "@/lib/utils";
import { ProviderError, providerErrorFromStatus } from "@/lib/providers/errors";
import { computeAdIntelligence } from "@/lib/intelligence";

type UnknownRecord = Record<string, unknown>;

type SearchApiKeyState = {
  disabled: boolean;
  cooldownUntil: number;
};

const keyStates = new Map<string, SearchApiKeyState>();
let nextKeyIndex = 0;
const TRANSIENT_COOLDOWN_MS = 30_000;
const DEFAULT_RATE_LIMIT_COOLDOWN_MS = 60_000;
const MAX_RATE_LIMIT_COOLDOWN_MS = 15 * 60_000;
const REQUEST_BUDGET_MS = 30_000;
const PER_KEY_TIMEOUT_MS = 12_000;

function record(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as UnknownRecord) : {};
}

function text(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  const nestedText = value && typeof value === "object" ? (value as UnknownRecord).text : null;
  if (typeof nestedText === "string") return nestedText.trim() || null;
  return null;
}

function creativeFromSnapshot(snapshot: UnknownRecord) {
  const cards = Array.isArray(snapshot.cards) ? snapshot.cards.map(record) : [];
  const firstCard = record(cards[0]);
  
  // Videos array
  const videos = Array.isArray(snapshot.videos) ? snapshot.videos.map(record) : [];
  const firstVideo = record(videos[0] || firstCard.video || firstCard);
  
  // Images array
  const images = Array.isArray(snapshot.images) ? snapshot.images.map(record) : [];
  const firstImage = record(images[0] || firstCard);

  const sourceMediaUrl = safeExternalUrl(
    text(firstVideo.video_hd_url) ||
    text(firstVideo.video_sd_url) ||
    text(snapshot.video_hd_url) ||
    text(snapshot.video_sd_url) ||
    text(firstImage.original_image_url) ||
    text(firstImage.resized_image_url) ||
    text(snapshot.original_image_url) ||
    text(snapshot.resized_image_url)
  );

  const thumbnailUrl = safeExternalUrl(
    text(firstVideo.video_preview_image_url) ||
    text(firstImage.resized_image_url) ||
    text(firstImage.original_image_url) ||
    text(snapshot.resized_image_url) ||
    text(snapshot.original_image_url) ||
    sourceMediaUrl
  );

  const display = String(snapshot.display_format || "").toLowerCase();
  
  // Build carousel assets from cards or images
  let carouselAssets: string[] = [];
  if (cards.length > 1) {
    carouselAssets = cards.flatMap((card) => {
      const v = record(card.video || card);
      return [
        text(v.video_hd_url), text(v.video_sd_url),
        text(card.original_image_url), text(card.resized_image_url)
      ];
    }).map(safeExternalUrl).filter((value): value is string => Boolean(value));
  } else if (images.length > 1) {
    carouselAssets = images.flatMap((img) => [text(img.original_image_url), text(img.resized_image_url)])
      .map(safeExternalUrl).filter((value): value is string => Boolean(value));
  } else if (videos.length > 1) {
    carouselAssets = videos.flatMap((vid) => [text(vid.video_hd_url), text(vid.video_sd_url)])
      .map(safeExternalUrl).filter((value): value is string => Boolean(value));
  }
  
  const hasVideo = text(firstVideo.video_hd_url) || text(firstVideo.video_sd_url) || display.includes("video");
  const isCarousel = cards.length > 1 || images.length > 1 || videos.length > 1;

  const mediaType: MediaType = 
    isCarousel ? "carousel" : hasVideo ? "video" : sourceMediaUrl ? "image" : "unknown";

  return { firstCard, sourceMediaUrl, thumbnailUrl, mediaType, carouselAssets: [...new Set(carouselAssets)] };
}

export function normalizeSearchApiAd(input: UnknownRecord, country?: string): NormalizedAd {
  const snapshot = record(input.snapshot);
  const creative = creativeFromSnapshot(snapshot);
  const active = Boolean(input.is_active);
  const startDate = text(input.start_date);
  const stopDate = active ? null : text(input.end_date);
  const runningDays = daysBetween(startDate, stopDate);
  const variants = Math.max(1, Number(input.collation_count) || 1);
  const repetition = Math.max(0, variants - 1);
  const bodyText = sanitizeAdCopy(text(snapshot.body)) || sanitizeAdCopy(text(creative.firstCard.body)) || sanitizeAdCopy(text(input.ad_creative_body));
  const captionText = sanitizeAdCopy(text(snapshot.caption)) || bodyText;
  const headlineText = sanitizeAdCopy(text(snapshot.title)) || sanitizeAdCopy(text(creative.firstCard.title)) || sanitizeAdCopy(text(input.ad_creative_link_title));
  const ctaText = text(snapshot.cta_text) || text(creative.firstCard.cta_text);
  const landingUrl = safeExternalUrl(text(snapshot.link_url) || text(creative.firstCard.link_url));
  const descText = sanitizeAdCopy(text(snapshot.link_description)) || sanitizeAdCopy(text(creative.firstCard.link_description)) || sanitizeAdCopy(text(input.ad_creative_link_description));
  const platformsList = Array.isArray(input.publisher_platform)
    ? input.publisher_platform.map((p: unknown) => String(p).toLowerCase())
    : [];

  const intel = computeAdIntelligence({
    startDate,
    stopDate,
    status: active ? "active" : "inactive",
    lastSeenAt: new Date().toISOString(),
    variants,
    creativeRepetition: repetition,
    platforms: platformsList,
    mediaType: creative.mediaType,
    headline: headlineText,
    body: bodyText,
    cta: ctaText,
    landingPageUrl: landingUrl,
    sourceMediaUrl: creative.sourceMediaUrl,
    advertiserId: text(input.page_id) || text(snapshot.page_id) || undefined,
  });

  return {
    id: String(input.ad_archive_id),
    externalAdId: String(input.ad_archive_id),
    advertiserId: text(input.page_id) || text(snapshot.page_id) || "unknown",
    advertiserName:
      text(input.page_name) || text(snapshot.page_name) || text(snapshot.current_page_name) || "Unknown advertiser",
    advertiserAvatarUrl: safeExternalUrl(text(snapshot.page_profile_picture_url)),
    advertiserProfileUrl: safeExternalUrl(text(snapshot.page_profile_uri)),
    body: bodyText,
    caption: captionText,
    headline: headlineText,
    description: descText,
    hashtags: extractHashtags([bodyText, captionText].filter(Boolean).join(" ")),
    cta: ctaText,
    landingPageUrl: landingUrl,
    sourceMediaUrl: creative.sourceMediaUrl,
    thumbnailUrl: creative.thumbnailUrl,
    carouselAssets: creative.carouselAssets,
    storedMediaPath: null,
    archiveStatus: "not_requested",
    mediaType: creative.mediaType,
    status: active ? "active" : "inactive",
    startDate,
    stopDate,
    firstSeenAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
    runningDays,
    country: country || null,
    platforms: platformsList,
    demographics: normalizeDemographics(input),
    snapshotUrl: safeExternalUrl(text(input.snapshot_url)),
    source: "searchapi",
    variants,
    creativeRepetition: repetition,
    brandActiveAds: null,
    winnerScore: intel.adjustedWinnerScore,
    intelligenceLabels: [intel.badgeCategory, intel.longevityLabel.split(" ")[0]],
    rawData: input,
  };
}

export class SearchApiProvider implements AdProvider {
  readonly capabilities: ProviderCapabilities = {
    keywordSearch: true, advertiserSearch: true, commercialAds: true,
    pagination: true, demographics: true, copy: true, landingPage: true,
    formats: "NATIVE",
    statuses: "NATIVE",
    markets: "NATIVE",
    languages: "NATIVE",
    niches: "UNSUPPORTED",
    contentStyles: "UNSUPPORTED",
    runtime: "POST_FILTER",
    videoLength: "UNSUPPORTED",
  };
  private endpoint = "https://www.searchapi.io/api/v1/search";
  private apiKeys: string[];

  constructor(apiKeys: string | string[]) {
    this.apiKeys = [...new Set((Array.isArray(apiKeys) ? apiKeys : [apiKeys]).map((key) => key.trim()).filter(Boolean))];
    if (!this.apiKeys.length) {
      throw new ProviderError("PROVIDER_NOT_CONFIGURED", "At least one SearchAPI key is required.", 503);
    }
  }

  private async request(body: UnknownRecord): Promise<UnknownRecord> {
    const keys = this.availableKeys();
    const serializedBody = JSON.stringify(body);
    const deadline = Date.now() + REQUEST_BUDGET_MS;
    let lastError: ProviderError | null = null;

    for (const apiKey of keys) {
      const remainingMs = deadline - Date.now();
      if (remainingMs <= 0) break;
      let response: Response;
      try {
        response = await fetch(this.endpoint, {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: serializedBody,
          signal: AbortSignal.timeout(Math.min(PER_KEY_TIMEOUT_MS, remainingMs)),
          cache: "no-store",
        });
      } catch {
        this.cooldown(apiKey, TRANSIENT_COOLDOWN_MS);
        lastError = new ProviderError(
          "PROVIDER_UNAVAILABLE",
          "SearchAPI request failed before a response was received.",
          502
        );
        continue;
      }

      const payload = record(await response.json().catch(() => ({})));
      if (response.ok) {
        keyStates.delete(apiKey);
        return payload;
      }

      const message =
        typeof payload.error === "string"
          ? payload.error
          : typeof payload.message === "string"
          ? payload.message
          : undefined;
      lastError = providerErrorFromStatus("SearchAPI", response.status, message);

      if (response.status === 401) {
        keyStates.set(apiKey, { disabled: true, cooldownUntil: Number.POSITIVE_INFINITY });
        continue;
      }
      if (response.status === 403) {
        this.cooldown(apiKey, MAX_RATE_LIMIT_COOLDOWN_MS);
        continue;
      }
      if (response.status === 429) {
        this.cooldown(apiKey, retryDelayMs(response, message));
        continue;
      }
      if (response.status >= 500) {
        this.cooldown(apiKey, TRANSIENT_COOLDOWN_MS);
        continue;
      }

      // Retrying another credential cannot fix an invalid query or missing resource.
      throw lastError;
    }

    throw lastError ?? this.poolUnavailableError();
  }

  private availableKeys() {
    const now = Date.now();
    const start = nextKeyIndex++ % this.apiKeys.length;
    const ordered = this.apiKeys.map((_, offset) => this.apiKeys[(start + offset) % this.apiKeys.length]);
    const available = ordered.filter((key) => {
      const state = keyStates.get(key);
      return !state?.disabled && (!state?.cooldownUntil || state.cooldownUntil <= now);
    });
    if (!available.length) throw this.poolUnavailableError();
    return available;
  }

  private cooldown(apiKey: string, delayMs: number) {
    keyStates.set(apiKey, { disabled: false, cooldownUntil: Date.now() + delayMs });
  }

  private poolUnavailableError() {
    const states = this.apiKeys.map((key) => keyStates.get(key));
    const allDisabled = states.every((state) => state?.disabled);
    return allDisabled
      ? new ProviderError("SEARCHAPI_AUTH_ERROR", "All configured SearchAPI keys are invalid or expired.", 401)
      : new ProviderError("SEARCHAPI_RATE_LIMIT", "All configured SearchAPI keys are temporarily cooling down.", 429);
  }

  async searchAds(filters: AdSearchFilters): Promise<AdSearchResult> {
    const searchQuery = filters.query?.trim() || (filters.brand ? undefined : "a");
    
    // Resolve multiple values
    let activeStatus = "all";
    if (filters.statuses && filters.statuses.length > 0) {
      if (filters.statuses.includes("active") && !filters.statuses.includes("inactive")) activeStatus = "active";
      else if (filters.statuses.includes("inactive") && !filters.statuses.includes("active")) activeStatus = "inactive";
    } else if (filters.status && filters.status !== "all") {
      activeStatus = filters.status;
    }

    let mediaType = "all";
    if (filters.formats && filters.formats.length > 0) {
      if (filters.formats.includes("carousel")) mediaType = "image_and_meme";
      else if (filters.formats.includes("video")) mediaType = "video";
      else if (filters.formats.includes("image")) mediaType = "image";
    } else if (filters.mediaType && filters.mediaType !== "all") {
      mediaType = filters.mediaType === "carousel" ? "image_and_meme" : filters.mediaType;
    }

    const contentLanguages = filters.languages?.length ? filters.languages.join(",") : filters.language || undefined;

    const markets = filters.markets?.length 
      ? filters.markets 
      : filters.country && filters.country !== "ALL" 
        ? [filters.country] 
        : ["ALL"];

    let allAds: NormalizedAd[] = [];
    let nextCursor: string | null = null;
    let total: number | null = null;

    // SearchAPI only supports one country at a time, so we iterate for multi-market selections
    // We limit to 3 markets to prevent quota exhaustion in a single search, or just run them.
    const marketsToFetch = markets.slice(0, 3); 

    for (const country of marketsToFetch) {
      const body: UnknownRecord = {
        engine: "meta_ad_library",
        q: searchQuery,
        country: country,
        active_status: activeStatus,
        media_type: mediaType,
        platforms: filters.platforms?.length ? filters.platforms.join(",") : undefined,
        content_languages: contentLanguages,
        start_date: filters.startDate || undefined,
        end_date: filters.endDate || undefined,
        sort_by: filters.sort === "newest" ? "most_recent" : "impressions_high_to_low",
        page_id: filters.brand || undefined,
        next_page_token: filters.cursor || undefined,
      };
      Object.keys(body).forEach((key) => body[key] === undefined && delete body[key]);
      
      const payload = await this.request(body);
      const parsedAds = Array.isArray(payload.ads)
        ? payload.ads.map((ad) => normalizeSearchApiAd(record(ad), country))
        : [];
      
      allAds = [...allAds, ...parsedAds];
      
      const pagination = record(payload.pagination);
      const information = record(payload.search_information);
      
      // If we are doing multi-market, pagination gets tricky. We'll only return the cursor of the first market.
      // This is a known limitation of multi-region searches without a unified provider cursor.
      if (!nextCursor && text(pagination.next_page_token)) {
        nextCursor = text(pagination.next_page_token);
      }
      if (typeof information.total_results === "number") {
        total = (total || 0) + information.total_results;
      }
    }

    // Deduplicate cross-region ads
    const seen = new Set<string>();
    allAds = allAds.filter((ad) => {
      if (seen.has(ad.externalAdId)) return false;
      seen.add(ad.externalAdId);
      return true;
    });

    if (filters.cta) allAds = allAds.filter((ad: NormalizedAd) => ad.cta?.toLowerCase() === filters.cta?.toLowerCase());
    
    // Support advanced runtime filter
    if (filters.runtime) {
      allAds = allAds.filter((ad: NormalizedAd) => {
        if (ad.runningDays === null) return false;
        if (filters.runtime!.minDays !== undefined && ad.runningDays < filters.runtime!.minDays) return false;
        if (filters.runtime!.maxDays !== undefined && ad.runningDays > filters.runtime!.maxDays) return false;
        return true;
      });
    } else if (filters.duration) {
      allAds = allAds.filter((ad: NormalizedAd) => durationMatches(ad.runningDays, filters.duration!));
    }
    
    allAds = sortNormalizedAds(allAds, filters.sort);

    return {
      ads: allAds,
      nextCursor,
      total,
      source: "provider",
    };
  }

  async getAd(id: string) {
    const result = await this.searchAds({ query: `"${id}"`, status: "all" });
    return result.ads.find((ad) => ad.externalAdId === id) ?? null;
  }

  async getAdvertiser(id: string): Promise<Advertiser | null> {
    const payload = await this.request({ engine: "meta_ad_library_page_info", page_id: id });
    const page = record(payload.page_info);
    if (!page.page_id) return null;
    return {
      id: String(page.page_id),
      name: text(page.page_name) || "Unknown page",
      avatarUrl: safeExternalUrl(text(page.profile_photo_url)),
      profileUrl: safeExternalUrl(text(page.page_uri)),
    };
  }
}

function retryDelayMs(response: Response, message?: string) {
  const retryAfterHeader = response.headers.get("retry-after");
  const retryAfterSeconds = Number(retryAfterHeader);
  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
    return Math.min(retryAfterSeconds * 1000, MAX_RATE_LIMIT_COOLDOWN_MS);
  }
  if (retryAfterHeader) {
    const retryAt = Date.parse(retryAfterHeader);
    if (Number.isFinite(retryAt) && retryAt > Date.now()) {
      return Math.min(retryAt - Date.now(), MAX_RATE_LIMIT_COOLDOWN_MS);
    }
  }
  if (message && /quota|credit|exhaust/i.test(message)) return MAX_RATE_LIMIT_COOLDOWN_MS;
  return DEFAULT_RATE_LIMIT_COOLDOWN_MS;
}

function extractHashtags(value: string | null) {
  return [...new Set(value?.match(/#[\p{L}\p{N}_]+/gu) ?? [])].slice(0, 30);
}

function normalizeDemographics(input: UnknownRecord) {
  const raw = record(input.demographic_distribution || input.demographics);
  if (!Object.keys(raw).length) return null;
  const numericRecord = (value: unknown) => {
    const source = record(value);
    const entries = Object.entries(source).flatMap(([key, amount]) => {
      const number = Number(amount);
      return Number.isFinite(number) ? [[key, number] as const] : [];
    });
    return entries.length ? Object.fromEntries(entries) : undefined;
  };
  const result = {
    age: numericRecord(raw.age), gender: numericRecord(raw.gender),
    regions: numericRecord(raw.regions || raw.region), reach: numericRecord(raw.reach),
  };
  return Object.values(result).some(Boolean) ? result : null;
}

function durationMatches(days: number | null, filter: string): boolean {
  if (days === null) return false;
  if (filter === "1-7") return days >= 1 && days <= 7;
  if (filter === "8-30") return days >= 8 && days <= 30;
  if (filter === "31-90") return days >= 31 && days <= 90;
  if (filter === "90+") return days > 90;
  return true;
}

function sortNormalizedAds(ads: NormalizedAd[], sort?: string): NormalizedAd[] {
  if (sort === "newest") {
    return [...ads].sort(
      (a, b) => new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime()
    );
  }
  if (sort === "oldest") {
    return [...ads].sort(
      (a, b) => new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime()
    );
  }
  if (sort === "longest") {
    return [...ads].sort((a, b) => (b.runningDays || 0) - (a.runningDays || 0));
  }
  return ads;
}
