import type { AdProvider, AdSearchFilters } from "@/lib/types";
import { getServerEnv } from "@/lib/env/server";
import { MetaProvider } from "@/lib/providers/meta";
import { SearchApiProvider } from "@/lib/providers/searchapi";
import { ForeplayProvider } from "@/lib/providers/foreplay";
import { ProviderError } from "@/lib/providers/errors";

export type ProviderHealthState =
  | "CONNECTED"
  | "DEGRADED"
  | "AUTH_ERROR"
  | "TOKEN_EXPIRED"
  | "RATE_LIMITED"
  | "PERMISSION_REQUIRED"
  | "UNAVAILABLE"
  | "NOT_CONFIGURED";

type CircuitState = { state: ProviderHealthState; lastChecked: number; errorDetail?: string; failures?: number };
export type ProviderName = "meta" | "searchapi" | "foreplay";
export type NamedAdProvider = { provider: AdProvider; name: ProviderName };

const circuitStore = new Map<ProviderName, CircuitState>();
const COOLDOWN_MS = 15 * 60_000;
const FAILURE_THRESHOLD = 3;

export function getProviderHealth(name: ProviderName): CircuitState {
  return circuitStore.get(name) || { state: "NOT_CONFIGURED", lastChecked: 0, failures: 0 };
}

export function setProviderHealth(name: ProviderName, state: ProviderHealthState, errorDetail?: string) {
  const previous = getProviderHealth(name);
  const failures = state === "CONNECTED" ? 0 : (previous.failures || 0) + 1;
  circuitStore.set(name, { state, lastChecked: Date.now(), errorDetail, failures });
}

export function clearProviderCircuit(name: ProviderName) {
  circuitStore.set(name, { state: "CONNECTED", lastChecked: Date.now(), failures: 0 });
}

function circuitOpen(name: ProviderName) {
  const health = getProviderHealth(name);
  const hardFailure = ["AUTH_ERROR", "TOKEN_EXPIRED", "RATE_LIMITED", "PERMISSION_REQUIRED"].includes(health.state);
  const repeatedFailure = (health.failures || 0) >= FAILURE_THRESHOLD && health.state === "UNAVAILABLE";
  return (hardFailure || repeatedFailure) && Date.now() - health.lastChecked < COOLDOWN_MS;
}

function canSatisfy(provider: AdProvider, filters: AdSearchFilters) {
  const caps = provider.capabilities;
  if (filters.query?.trim() && !caps.keywordSearch) return false;
  if (filters.brand && !caps.advertiserSearch) return false;
  if (filters.cursor && !caps.pagination) return false;
  
  if (filters.niches && filters.niches.length > 0 && caps.niches === "UNSUPPORTED") return false;
  if (filters.contentStyles && filters.contentStyles.length > 0 && caps.contentStyles === "UNSUPPORTED") return false;
  if (filters.videoLength && caps.videoLength === "UNSUPPORTED") return false;
  if (filters.runtime && caps.runtime === "UNSUPPORTED") return false;
  if (filters.languages && filters.languages.length > 0 && caps.languages === "UNSUPPORTED") return false;
  
  if (filters.markets && filters.markets.length > 0 && caps.markets === "UNSUPPORTED") return false;
  if (filters.country && filters.country !== "ALL" && caps.markets === "UNSUPPORTED") return false;
  
  if (filters.formats && filters.formats.length > 0 && caps.formats === "UNSUPPORTED") return false;
  if (filters.mediaType && filters.mediaType !== "all" && caps.formats === "UNSUPPORTED") return false;
  
  if (filters.statuses && filters.statuses.length > 0 && caps.statuses === "UNSUPPORTED") return false;
  if (filters.status && filters.status !== "all" && caps.statuses === "UNSUPPORTED") return false;

  return true;
}

export function getAdProviders(filters: AdSearchFilters = {}): NamedAdProvider[] {
  const env = getServerEnv();
  const configured: NamedAdProvider[] = [];

  // Exhaust the SearchAPI key pool first, then use the direct Meta provider.
  // Foreplay remains the final compatible fallback.
  if (env.searchApiKeys.length) configured.push({ provider: new SearchApiProvider(env.searchApiKeys), name: "searchapi" });
  if (env.metaAccessToken && env.metaApiVersion) configured.push({
    provider: new MetaProvider({ accessToken: env.metaAccessToken, apiVersion: env.metaApiVersion, defaultCountry: env.metaDefaultCountry }),
    name: "meta",
  });
  if (env.foreplayApiKey) configured.push({ provider: new ForeplayProvider(env.foreplayApiKey), name: "foreplay" });

  const selected = env.adsProvider === "auto" ? configured : configured.filter((item) => item.name === env.adsProvider);
  if (!selected.length) throw new ProviderError("PROVIDER_NOT_CONFIGURED", `${env.adsProvider === "auto" ? "No ads provider is" : `${env.adsProvider} is not`} configured.`, 503);

  const capable = selected.filter(({ provider, name }) => canSatisfy(provider, filters) && !circuitOpen(name));
  if (capable.length) return capable;

  const compatibleButOpen = selected.filter(({ provider }) => canSatisfy(provider, filters));
  if (compatibleButOpen.length) throw new ProviderError("PROVIDER_UNAVAILABLE", "Compatible ad providers are temporarily paused after repeated failures.", 503);
  throw new ProviderError("PROVIDER_NOT_CONFIGURED", "No configured provider supports these search filters.", 422);
}

export const providerCapabilities = {
  meta: new MetaProvider({ accessToken: "capability-only", apiVersion: "v25.0" }).capabilities,
  searchapi: new SearchApiProvider("capability-only").capabilities,
  foreplay: new ForeplayProvider("capability-only").capabilities,
} as const;
