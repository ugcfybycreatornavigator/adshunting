import "server-only";
import type { NormalizedAd } from "@/lib/types";
import { normalizedToDb } from "@/lib/catalog";
import { createAdminClient } from "@/lib/supabase/admin";
import { integrationConfig } from "@/lib/env/server";

export async function persistNormalizedAds(ads: NormalizedAd[]) {
  if (!ads.length || !integrationConfig().supabase) return { persisted: 0, error: null };
  try {
    const admin = createAdminClient();
    const rows = ads.map(normalizedToDb);
    const { error } = await admin.from("ads").upsert(rows, { onConflict: "external_ad_id" });
    if (error) throw error;
    return { persisted: rows.length, error: null };
  } catch {
    return { persisted: 0, error: "Normalized ads could not be persisted." };
  }
}

export function adsForClient(ads: NormalizedAd[]) {
  return ads.map(ad => { const clientAd = { ...ad }; delete clientAd.rawData; return clientAd; });
}
