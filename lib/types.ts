export type AdStatus = "active" | "inactive" | "unknown";
export type MediaType = "image" | "video" | "carousel" | "unknown";

export type FilterCapability = "NATIVE" | "CACHED" | "POST_FILTER" | "UNSUPPORTED";

export type ProviderCapabilities = {
  keywordSearch: boolean;
  advertiserSearch: boolean;
  commercialAds: boolean;
  pagination: boolean;
  demographics: boolean;
  copy: boolean;
  landingPage: boolean;
  formats: FilterCapability;
  statuses: FilterCapability;
  markets: FilterCapability;
  languages: FilterCapability;
  niches: FilterCapability;
  contentStyles: FilterCapability;
  runtime: FilterCapability;
  videoLength: FilterCapability;
};

export interface NormalizedDemographics {
  age?: Record<string, number>;
  gender?: Record<string, number>;
  regions?: Record<string, number>;
  reach?: Record<string, number>;
}

export interface NormalizedAd {
  id: string;
  externalAdId: string;
  advertiserId: string;
  advertiserName: string;
  advertiserAvatarUrl: string | null;
  advertiserProfileUrl: string | null;
  body: string | null;
  caption: string | null;
  headline: string | null;
  description: string | null;
  hashtags: string[];
  cta: string | null;
  landingPageUrl: string | null;
  sourceMediaUrl: string | null;
  thumbnailUrl: string | null;
  carouselAssets: string[];
  storedMediaPath: string | null;
  archiveStatus: "not_requested" | "archived" | "failed" | "unavailable";
  mediaType: MediaType;
  status: AdStatus;
  startDate: string | null;
  stopDate: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
  runningDays: number | null;
  country: string | null;
  platforms: string[];
  demographics: NormalizedDemographics | null;
  snapshotUrl: string | null;
  source: "searchapi" | "meta" | "foreplay" | "catalog";
  variants: number;
  creativeRepetition: number;
  brandActiveAds: number | null;
  winnerScore: number;
  intelligenceLabels: string[];
  rawData?: Record<string, unknown>;
}

export interface AdSearchFilters {
  query?: string;
  brand?: string;
  platforms?: string[];
  sort?: string;
  cursor?: string;
  cta?: string;
  
  // Legacy singular properties (preserved for backward compatibility)
  status?: "all" | AdStatus;
  country?: string;
  mediaType?: "all" | MediaType;
  language?: string;
  duration?: string;
  startDate?: string;
  endDate?: string;

  // New plural and advanced properties
  formats?: MediaType[];
  statuses?: AdStatus[];
  markets?: string[];
  languages?: string[];
  niches?: string[];
  contentStyles?: string[];
  
  runtime?: {
    preset?: string;
    minDays?: number;
    maxDays?: number;
  };
  
  videoLength?: {
    preset?: string;
    minSeconds?: number;
    maxSeconds?: number;
  };
}

export interface AdSearchResult {
  ads: NormalizedAd[];
  nextCursor: string | null;
  total: number | null;
  source: "provider" | "catalog";
}

export interface Advertiser {
  id: string;
  name: string;
  avatarUrl: string | null;
  profileUrl: string | null;
}

export interface AdProvider {
  readonly capabilities: ProviderCapabilities;
  searchAds(filters: AdSearchFilters): Promise<AdSearchResult>;
  getAd?(id: string): Promise<NormalizedAd | null>;
  getAdvertiser?(id: string): Promise<Advertiser | null>;
}

export interface SwipeFile {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  systemKey: string | null;
  adCount?: number;
  previewMedia?: string[];
  createdAt: string;
  updatedAt: string;
}

export type SharedAdContentType = "single" | "multiple" | "swipe_file";

export interface SharedAdLink {
  id: string;
  ownerUserId: string;
  name: string;
  message?: string;
  tokenHash: string;
  contentType: "single" | "multiple" | "swipe_file";
  swipeFileId?: string;
  expiresAt?: string;
  revokedAt?: string;
  visibility: "public" | "private";
  allowSave: boolean;
  allowDownload: boolean;
  createdAt: string;
  updatedAt: string;
  lastViewedAt?: string;
  status: "active" | "expired" | "disabled";
  views: number;
  itemCount: number;
}
