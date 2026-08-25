declare const Deno: { env: { get(key: string): string | undefined } };
import type { AdSearchFilters, AdSearchResult, ProviderName, AdProvider } from "./types.ts";
import { ProviderError } from "./providers/errors.ts";
import { MetaProvider } from "./providers/meta.ts";
import { SearchApiProvider } from "./providers/searchapi.ts";
import { MetaApiIoProvider } from "./providers/metaapiio.ts";

const TRANSIENT_ERROR_CODES = [
  "RATE_LIMIT", "PROVIDER_TIMEOUT", "PROVIDER_UNAVAILABLE", "UPSTREAM"
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type CircuitState = {
  failures: number;
  openedAt?: number;
  status: "closed" | "open" | "half-open";
};

const circuitBreakers = new Map<string, CircuitState>();

const MAX_FAILURES = 5;
const COOLDOWN_MS = 30_000;

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
    // 1. PRIMARY: Official Meta
    const metaEnabled = Deno.env.get("META_AD_LIBRARY_ENABLED") === "true";
    const metaToken = Deno.env.get("META_AD_LIBRARY_ACCESS_TOKEN");
    const metaVersion = Deno.env.get("META_GRAPH_API_VERSION") || "v26.0";
    
    this.providers.push(new MetaProvider({
      accessToken: metaEnabled ? metaToken : undefined,
      apiVersion: metaVersion,
      defaultCountry: Deno.env.get("META_DEFAULT_COUNTRY") || "US",
      timeoutMs: parseInt(Deno.env.get("META_API_TIMEOUT_MS") || "5000", 10),
    }));

    // 2. FALLBACK: SearchAPI
    const envVars = Deno.env.toObject();
    const searchApiKeys = Object.entries(envVars)
      .filter(([key]) => key === "SEARCHAPI_API_KEY" || key.startsWith("SEARCH_API_KEY"))
      .map(([_, val]) => val)
      .filter(Boolean);
    
    this.providers.push(new SearchApiProvider(searchApiKeys));

    // 3. TERTIARY: MetaAPI.io (Keep as legacy fallback if needed)
    const metaApiIoKey = Deno.env.get("METAAPI_IO_API_KEY");
    this.providers.push(new MetaApiIoProvider(metaApiIoKey));
  }

  private isCircuitOpen(providerName: string): boolean {
    const state = circuitBreakers.get(providerName) || { failures: 0, status: "closed" };
    if (state.status === "open") {
      if (state.openedAt && Date.now() - state.openedAt > COOLDOWN_MS) {
        state.status = "half-open";
        circuitBreakers.set(providerName, state);
        return false;
      }
      return true;
    }
    return false;
  }

  private recordSuccess(providerName: string) {
    circuitBreakers.set(providerName, { failures: 0, status: "closed" });
  }

  private recordFailure(providerName: string, isTransient: boolean) {
    if (!isTransient) return;
    const state = circuitBreakers.get(providerName) || { failures: 0, status: "closed" };
    state.failures += 1;
    if (state.failures >= MAX_FAILURES) {
      state.status = "open";
      state.openedAt = Date.now();
    }
    circuitBreakers.set(providerName, state);
  }

  async search(filters: AdSearchFilters, opts?: { requestId?: string }): Promise<OrchestratorResult> {
    const configuredProviders = this.providers.filter(p => p.isConfigured());

    console.info(JSON.stringify({
      event: "ads_provider_registry",
      requestId: opts?.requestId,
      configured_count: configuredProviders.length,
      officialMeta: this.providers[0].isConfigured(),
      searchApi: this.providers[1].isConfigured(),
      metaApiIo: this.providers[2].isConfigured(),
      envValidation: {
        metaToken: Boolean(Deno.env.get("META_AD_LIBRARY_ACCESS_TOKEN")),
        searchApiKey: Boolean(Deno.env.get("SEARCHAPI_API_KEY")),
        metaApiIoKey: Boolean(Deno.env.get("METAAPI_IO_API_KEY"))
      }
    }));

    if (configuredProviders.length === 0) {
      throw new ProviderError("PROVIDER_NOT_CONFIGURED", "No providers configured", 503);
    }

    const attempts: { provider: string; error?: string }[] = [];

    for (const provider of configuredProviders) {
      if (this.isCircuitOpen(provider.name)) {
        console.warn(JSON.stringify({
          event: "ads_provider_circuit_open",
          requestId: opts?.requestId,
          provider: provider.name
        }));
        continue;
      }

      let retryCount = 0;
      const maxRetries = 1;

      while (retryCount <= maxRetries) {
        const startTime = Date.now();
        try {
          const result = await provider.searchAds(filters);
          
          this.recordSuccess(provider.name);

          console.info(JSON.stringify({
            event: "ads_provider_success",
            requestId: opts?.requestId,
            provider: provider.name,
            durationMs: Date.now() - startTime,
            resultCount: result.ads.length,
            attempt: retryCount + 1
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
          const providerError = error instanceof ProviderError ? error : new ProviderError("PROVIDER_UNAVAILABLE", String(error), 500);
          
          const isTransient = TRANSIENT_ERROR_CODES.includes(providerError.code) || 
                              providerError.status >= 500 || 
                              providerError.status === 429 || 
                              providerError.status === 408;

          this.recordFailure(provider.name, isTransient);

          console.error(JSON.stringify({
            event: "ads_provider_failure",
            requestId: opts?.requestId,
            provider: provider.name,
            code: providerError.code,
            status: providerError.status,
            durationMs: Date.now() - startTime,
            isTransient,
            attempt: retryCount + 1
          }));

          if (isTransient && retryCount < maxRetries) {
            retryCount++;
            const backoff = 250 * Math.pow(2, retryCount - 1) + Math.random() * 100;
            await sleep(backoff);
            continue;
          }

          attempts.push({
            provider: provider.name,
            error: providerError.code
          });

          // Failover conditions
          const shouldFailover = isTransient || 
            ["AUTH", "PERMISSION", "COVERAGE", "PROVIDER_NOT_CONFIGURED", "UNKNOWN"].includes(providerError.code) || 
            providerError.status === 401 || 
            providerError.status === 403;
          
          if (!shouldFailover) {
            throw providerError;
          }
          break; // break the retry loop and continue to the next provider
        }
      }
    }

    throw new ProviderError("PROVIDER_UNAVAILABLE", "Search is temporarily unavailable. All configured providers failed.", 503);
  }
}
