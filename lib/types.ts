export type AdStatus = "active" | "inactive" | "unknown";
export type MediaType = "image" | "video" | "carousel" | "unknown";

export type ProviderCapabilities = {
  keywordSearch: boolean;
  advertiserSearch: boolean;
  commercialAds: boolean;
  activeAds: boolean;
  inactiveAds: boolean;
  imageCreative: boolean;
  videoCreative: boolean;
  carouselCreative: boolean;
  copy: boolean;
  landingPage: boolean;
  demographics: boolean;
  pagination: boolean;
  countryFilter: boolean;
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
  status?: "all" | AdStatus;
  country?: string;
  platforms?: string[];
  mediaType?: "all" | MediaType;
  cta?: string;
  duration?: string;
  startDate?: string;
  endDate?: string;
  brand?: string;
  language?: string;
  sort?: string;
  cursor?: string;
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

export interface Collection {
  id: string;
  name: string;
  description: string | null;
  adCount?: number;
  createdAt: string;
  updatedAt: string;
}
