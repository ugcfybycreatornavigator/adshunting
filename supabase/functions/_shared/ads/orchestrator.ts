declare const Deno: { env: { get(key: string): string | undefined } };
import type { AdSearchFilters, AdSearchResult, ProviderName, AdProvider } from "./types.ts";
import { ProviderError } from "./providers/errors.ts";
import { MetaProvider } from "./providers/meta.ts";
import { SearchApiProvider } from "./providers/searchapi.ts";
import { MetaApiIoProvider } from "./providers/metaapiio.ts";

export type OrchestratorResult = AdSearchResult & {
  providerMeta?: {
    provider: ProviderName;
    fallbackUsed: boolean;
    fallbackReason?: string;
  };
};

export class AdsProviderOrchestrator {
  private providers: AdProvider[] = [];

  constructor() {
    // 1. PRIMARY: SearchAPI
    const searchApiKey = Deno.env.get("SEARCHAPI_API_KEY");
    this.providers.push(new SearchApiProvider(searchApiKey));

    // 2. SECONDARY: MetaAPI.io
    const metaApiIoKey = Deno.env.get("METAAPI_IO_API_KEY");
    this.providers.push(new MetaApiIoProvider(metaApiIoKey));

    // 3. LAST RESORT: Official Meta
    const metaEnabled = Deno.env.get("META_AD_LIBRARY_ENABLED") === "true";
    const metaToken = Deno.env.get("META_AD_LIBRARY_ACCESS_TOKEN");
    const metaVersion = Deno.env.get("META_GRAPH_API_VERSION") || "v26.0";
    
    this.providers.push(new MetaProvider({
      accessToken: metaEnabled ? metaToken : undefined,
      apiVersion: metaVersion,
      defaultCountry: Deno.env.get("META_DEFAULT_COUNTRY") || "US",
      timeoutMs: parseInt(Deno.env.get("META_API_TIMEOUT_MS") || "20000", 10),
    }));
  }

  async search(filters: AdSearchFilters): Promise<OrchestratorResult> {
    const configuredProviders = this.providers.filter(p => p.isConfigured());

    console.info(JSON.stringify({
      event: "ads_provider_registry",
      configured_count: configuredProviders.length,
      searchApi: this.providers[0].isConfigured(),
      metaApiIo: this.providers[1].isConfigured(),
      officialMeta: this.providers[2].isConfigured()
    }));

    if (configuredProviders.length === 0) {
      throw new ProviderError("PROVIDER_NOT_CONFIGURED", "No providers configured", 503);
    }

    const attempts: { provider: string; error?: string }[] = [];

    for (const provider of configuredProviders) {
      const startTime = Date.now();
      try {
        const result = await provider.searchAds(filters);
        
        console.info(JSON.stringify({
          event: "ads_provider_success",
          provider: provider.name,
          durationMs: Date.now() - startTime,
          resultCount: result.ads.length
        }));

        return {
          ...result,
          providerMeta: {
            provider: provider.name,
            fallbackUsed: attempts.length > 0,
            fallbackReason: attempts.length > 0 ? attempts[attempts.length - 1].error : undefined,
          }
        };
      } catch (error) {
        const providerError = error instanceof ProviderError ? error : new ProviderError("UNKNOWN", String(error));
        
        console.error(JSON.stringify({
          event: "ads_provider_failure",
          provider: provider.name,
          code: providerError.code,
          status: providerError.status,
          durationMs: Date.now() - startTime
        }));

        attempts.push({
          provider: provider.name,
          error: providerError.code
        });

        // Failover conditions: auth issues, rate limits, timeouts, upstream errors, empty config.
        // A genuine empty result (200 OK with 0 ads) is NOT an error and will return above.
        const shouldFailover = [
          "AUTH", 
          "PERMISSION", 
          "RATE_LIMIT", 
          "TIMEOUT", 
          "COVERAGE", 
          "UPSTREAM", 
          "PROVIDER_NOT_CONFIGURED",
          "PROVIDER_TIMEOUT",
          "PROVIDER_UNAVAILABLE",
          "UNKNOWN"
        ].includes(providerError.code) || providerError.status >= 500 || providerError.status === 429 || providerError.status === 401 || providerError.status === 403;
        
        if (!shouldFailover) {
          throw providerError;
        }
      }
    }

    throw new ProviderError("PROVIDER_UNAVAILABLE", "Search is temporarily unavailable. All configured providers failed.", 503);
  }
}
