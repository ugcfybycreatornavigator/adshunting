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

export interface NormalizedCarouselCard {
  headline: string | null;
  description: string | null;
  body: string | null;
  callToAction: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  destinationUrl: string | null;
}

export interface NormalizedAd {
  id: string;
  externalAdId: string;
  canonicalAdId: string;
  creativeFingerprint: string;
  creativeGroupId: string;
  observationCount: number;
  providerAdIds: string[];
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
  carouselCards?: NormalizedCarouselCard[];
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
  source: "searchapi" | "meta" | "foreplay" | "catalog" | "metaapi_io";
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
  view?: "ads" | "brands";
  
  status?: "all" | AdStatus;
  country?: string;
  mediaType?: "all" | MediaType;
  language?: string;
  duration?: string;
  startDate?: string;
  endDate?: string;

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

export type ProviderName = "meta" | "searchapi" | "foreplay" | "metaapi_io";

export interface AdSearchResult {
  ads: NormalizedAd[];
  nextCursor: string | null;
  total: number | null;
  source: "provider" | "catalog";
}

export interface AdProvider {
  readonly name: ProviderName;
  isConfigured(): boolean;
  searchAds(filters: AdSearchFilters): Promise<AdSearchResult>;
}
