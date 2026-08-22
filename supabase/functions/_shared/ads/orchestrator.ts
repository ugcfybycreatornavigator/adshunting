declare const Deno: { env: { get(key: string): string | undefined } };
import type { AdSearchFilters, AdSearchResult, ProviderName } from "./types.ts";
import { ProviderError } from "./providers/errors.ts";
import { MetaProvider } from "./providers/meta.ts";
import { SearchApiProvider } from "./providers/searchapi.ts";

export type OrchestratorResult = AdSearchResult & {
  providerMeta?: {
    provider: ProviderName;
    fallbackUsed: boolean;
    fallbackReason?: string;
  };
};

export class AdsProviderOrchestrator {
  private metaProvider: MetaProvider | null = null;
  private searchApiProvider: SearchApiProvider | null = null;

  constructor() {
    const metaEnabled = Deno.env.get("META_AD_LIBRARY_ENABLED") === "true";
    const metaToken = Deno.env.get("META_AD_LIBRARY_ACCESS_TOKEN");
    const metaVersion = Deno.env.get("META_GRAPH_API_VERSION") || "v26.0";
    
    // We do not require default country, fallback to ALL if missing
    
    if (metaEnabled && metaToken) {
      this.metaProvider = new MetaProvider({
        accessToken: metaToken,
        apiVersion: metaVersion,
        defaultCountry: Deno.env.get("META_DEFAULT_COUNTRY") || "US",
        timeoutMs: parseInt(Deno.env.get("META_API_TIMEOUT_MS") || "20000", 10),
      });
    }

    const searchApiKey = Deno.env.get("SEARCHAPI_API_KEY");
    if (searchApiKey) {
      // SearchApiProvider takes an array of keys
      this.searchApiProvider = new SearchApiProvider([searchApiKey]);
    }
  }

  async search(filters: AdSearchFilters): Promise<OrchestratorResult> {
    if (!this.metaProvider && !this.searchApiProvider) {
      throw new ProviderError("PROVIDER_UNAVAILABLE", "No providers configured", 503);
    }

    let metaError: ProviderError | null = null;

    if (this.metaProvider) {
      try {
        const result = await this.metaProvider.searchAds(filters);
        return {
          ...result,
          providerMeta: {
            provider: "meta",
            fallbackUsed: false,
          }
        };
      } catch (error) {
        if (error instanceof ProviderError) {
          metaError = error;
          // Fallback conditions
          const shouldFallback = [
            "AUTH", 
            "PERMISSION", 
            "RATE_LIMIT", 
            "TIMEOUT", 
            "COVERAGE", 
            "UPSTREAM", 
            "EMPTY_RESULTS",
            "META_PERMISSION_ERROR",
            "META_TOKEN_EXPIRED",
            "PROVIDER_TIMEOUT",
            "PROVIDER_UNAVAILABLE"
          ].includes(error.code);
          
          if (!shouldFallback && this.searchApiProvider) {
            throw error;
          }
        } else {
          throw error;
        }
      }
    }

    if (this.searchApiProvider) {
      const result = await this.searchApiProvider.searchAds(filters);
      return {
        ...result,
        providerMeta: {
          provider: "searchapi",
          fallbackUsed: !!metaError,
          fallbackReason: metaError?.code,
        }
      };
    }

    if (metaError) throw metaError;
    throw new ProviderError("PROVIDER_UNAVAILABLE", "Search failed unexpectedly", 500);
  }
}
