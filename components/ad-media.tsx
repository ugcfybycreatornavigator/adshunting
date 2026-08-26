"use client";

import { ImageIcon } from "lucide-react";
import type { NormalizedAd } from "@/lib/types";
import { safeExternalUrl } from "@/lib/utils";
import { VideoPreview } from "@/components/video-preview";
import { CarouselPreview } from "@/components/carousel-preview";
import { useState } from "react";

export function AdMedia({
  ad,
  variant = "card",
  className = "",
}: {
  ad: NormalizedAd;
  variant?: "card" | "detail";
  className?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const type = ad.creative.type;
  const videoUrl = safeExternalUrl(ad.creative.videoUrl);
  const imageUrl = safeExternalUrl(ad.creative.imageUrl);
  const thumbnailUrl = safeExternalUrl(ad.creative.thumbnailUrl);
  const advertiserName = ad.advertiser.name || "Unknown advertiser";
  
  const objectFit = variant === "detail" ? "contain" : "cover";
  
  if (type === "video") {
    const videoSources: string[] = [];
    if (ad.enrichment?.archiveStatus === "archived" && ad.creative.videoUrl) {
      const ext = ad.creative.videoUrl.includes(".webm") ? "webm" : "mp4";
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ctvmjxpblfdrxvvyjebw.supabase.co";
      videoSources.push(`${supabaseUrl}/storage/v1/object/public/ad-creatives/${ad.provider.discoveryProvider}/${ad.id}/source.${ext}`);
    }
    if (videoUrl) {
      videoSources.push(videoUrl);
    }
    
    if (videoSources.length > 0) {
      return (
        <div className={`h-full w-full bg-zinc-950 flex items-center justify-center relative ${className}`}>
          <VideoPreview
            src={videoSources}
          poster={thumbnailUrl || imageUrl}
          controls={variant === "detail"}
          objectFit={objectFit}
          className="h-full w-full"
        />
      </div>
    );
  }
  }

  if (type === "carousel" && Array.isArray(ad.creative.carouselItems) && ad.creative.carouselItems.length > 0) {
    const assets = ad.creative.carouselItems
      .map(item => safeExternalUrl(item.imageUrl || item.videoUrl))
      .filter(Boolean) as string[];
      
    if (assets.length > 0) {
      return (
        <div className={`h-full w-full bg-zinc-900 flex items-center justify-center relative ${className}`}>
          <CarouselPreview 
            assets={assets} 
            alt={`Creative from ${advertiserName}`} 
            className="h-full w-full" 
          />
        </div>
      );
    }
  }

  // Fallback to image if it's explicitly an image, OR if video/carousel failed to have valid URLs
  const fallbackImage = imageUrl || thumbnailUrl;
  
  if (fallbackImage && !imageFailed) {
    return (
      <div className={`h-full w-full flex items-center justify-center relative ${variant === 'detail' ? 'bg-zinc-900' : 'bg-zinc-50'} ${className}`}>
        <img
          src={fallbackImage}
          alt={`Creative from ${advertiserName}`}
          className={`h-full w-full text-transparent ${objectFit === "contain" ? "object-contain" : "object-cover"}`}
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      </div>
    );
  }

  return (
    <div className={`flex h-full w-full flex-col items-center justify-center gap-3 bg-zinc-50/80 text-muted border-y border-line/50 ${className}`}>
      <div className="grid size-12 place-items-center rounded-full bg-white shadow-sm border border-line">
        <ImageIcon size={20} className="text-zinc-400" />
      </div>
      <p className="text-xs font-medium">Creative unavailable</p>
    </div>
  );
}
