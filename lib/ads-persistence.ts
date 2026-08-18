import "server-only";
import type { NormalizedAd } from "@/lib/types";
import { normalizedToDb } from "@/lib/catalog";
import { createAdminClient } from "@/lib/supabase/admin";
import { archiveMediaFromUrl } from "./media-archiver";
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

export async function archiveAdsInBackground(ads: NormalizedAd[]) {
  if (!ads.length || !integrationConfig().supabase) return;
  const admin = createAdminClient();
  
  
  for (const ad of ads) {
    if (ad.archiveStatus === "archived" || ad.archiveStatus === "unavailable" || ad.archiveStatus === "failed") continue;
    if (!ad.sourceMediaUrl && !ad.carouselAssets?.length) continue;
    
    let newSourceUrl = ad.sourceMediaUrl;
    let newThumbnailUrl = ad.thumbnailUrl;
    const newCarouselAssets: string[] = [];
    let failed = false;
    
    if (newSourceUrl && !newSourceUrl.includes("supabase.co")) {
      const ext = newSourceUrl.includes(".mp4") ? "mp4" : "webp";
      const path = `${ad.source}/${ad.id}/source.${ext}`;
      const res = await archiveMediaFromUrl(admin, newSourceUrl, path);
      if (res.path) {
         newSourceUrl = admin.storage.from("ad-creatives").getPublicUrl(res.path).data.publicUrl;
      } else {
         failed = true;
      }
    }
    
    if (newThumbnailUrl && !newThumbnailUrl.includes("supabase.co")) {
      const path = `${ad.source}/${ad.id}/thumbnail.webp`
      const res = await archiveMediaFromUrl(admin, newThumbnailUrl, path);
      if (res.path) {
         newThumbnailUrl = admin.storage.from("ad-creatives").getPublicUrl(res.path).data.publicUrl;
      }
    }
    
    if (ad.carouselAssets && ad.carouselAssets.length > 0) {
       for (let i = 0; i < ad.carouselAssets.length; i++) {
          const assetUrl = ad.carouselAssets[i];
          if (assetUrl.includes("supabase.co")) {
             newCarouselAssets.push(assetUrl);
             continue;
          }
          const ext = assetUrl.includes(".mp4") ? "mp4" : "webp";
          const path = `${ad.source}/${ad.id}/carousel-${i}.${ext}`;
          const res = await archiveMediaFromUrl(admin, assetUrl, path);
          if (res.path) {
             newCarouselAssets.push(admin.storage.from("ad-creatives").getPublicUrl(res.path).data.publicUrl);
          } else {
             newCarouselAssets.push(assetUrl);
          }
       }
    }
    
    const finalStatus = failed ? "failed" : "archived";
    
    await admin.from("ads").update({
       source_media_url: newSourceUrl,
       thumbnail_url: newThumbnailUrl,
       carousel_assets: newCarouselAssets,
       archive_status: finalStatus
    }).eq("id", ad.id);
  }
}
