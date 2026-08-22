"use client";

import { ImageIcon, PlaySquare, Images } from "lucide-react";
import type { NormalizedAd } from "@/lib/types";
import { formatDuration, safeExternalUrl, sanitizeAdCopy, cn } from "@/lib/utils";
import { VideoPreview } from "@/components/video-preview";
import { CarouselPreview } from "@/components/carousel-preview";
import { Badge } from "@/components/ui";

function signalLabel(label: string | undefined | null, ad: NormalizedAd) {
  if (!label) return "Unknown";
  if (label === "High-Confidence Winner") return "Exceptional";
  if (label === "Proven Long Runner") return "Long Runner";
  if (label === "Emerging Winner") return "Promising";
  if (label === "Standard") return (ad.intelligence.winnerScore ?? 0) >= 70 ? "Strong Signal" : (ad.intelligence.winnerScore ?? 0) >= 55 ? "Promising" : "Testing";
  if (label === "Testing") return "Testing";
  return label.replace(/\(.+\)/, "").trim() || "Unknown";
}

function titleCase(value: string) {
  if (!value) return "";
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function SharedCreativeView({ ad }: { ad: NormalizedAd }) {
  const media = safeExternalUrl(ad.creative.videoUrl || ad.creative.imageUrl);
  const thumb = safeExternalUrl(ad.creative.thumbnailUrl);
  const advertiserName = ad.advertiser.name || "Unknown advertiser";
  const initial = advertiserName.slice(0, 1).toUpperCase() || "A";

  const displayCopy =
    sanitizeAdCopy(ad.copy.headline) ||
    sanitizeAdCopy(ad.copy.primaryText) ||
    sanitizeAdCopy(ad.copy.description);

  return (
    <article className="flex flex-col overflow-hidden rounded-[16px] border border-line bg-white shadow-sm md:flex-row mb-6 w-full max-w-5xl mx-auto">
      {/* 60% Media Section */}
      <div className="relative w-full md:w-[55%] lg:w-[60%] shrink-0 bg-zinc-50 border-b md:border-b-0 md:border-r border-line aspect-square md:aspect-auto">
        <div className="absolute inset-0">
           <CreativePreview ad={ad} media={media} thumb={thumb} advertiserName={advertiserName} />
        </div>
      </div>

      {/* 40% Information Section */}
      <div className="flex w-full md:w-[45%] lg:w-[40%] flex-col p-5 md:p-6 lg:p-8">
        <div className="flex items-center gap-3">
          {ad.advertiser.logoUrl ? (
            <img 
              src={ad.advertiser.logoUrl} 
              alt="" 
              className="size-10 shrink-0 rounded-full border border-line object-cover bg-zinc-50" 
              loading="lazy"
            />
          ) : (
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-black text-xs font-bold text-white">{initial}</span>
          )}
          <div className="flex flex-col min-w-0">
            <span className="truncate text-base font-semibold text-ink">
              {advertiserName}
            </span>
            <span className="truncate text-xs font-medium text-muted">
               {(Array.isArray(ad.delivery.platforms) ? ad.delivery.platforms : []).map(titleCase).join(" + ") || "Unknown Platform"}
            </span>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 flex-wrap">
          <Badge tone={ad.delivery.status === "active" ? "red" : "dark"} className="px-2 py-1 text-[11px] shadow-sm uppercase font-semibold tracking-wide">
            {ad.delivery.status || "Unknown"}
          </Badge>
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-100 text-[11px] font-semibold text-zinc-600 capitalize">
            {ad.creative.type === "video" ? <PlaySquare size={13} /> : ad.creative.type === "carousel" ? <Images size={13} /> : <ImageIcon size={13} />}
            {ad.creative.type || "Unknown"}
          </span>
          {ad.delivery.daysRunning != null && (
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-zinc-100 text-[11px] font-semibold text-zinc-600">
              {formatDuration(ad.delivery.daysRunning)}
            </span>
          )}
        </div>

        <div className="mt-6 flex-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Ad Copy</h4>
          <p className={cn("text-sm leading-relaxed whitespace-pre-wrap max-h-[200px] overflow-y-auto pr-2 custom-scrollbar", displayCopy ? "text-ink" : "text-muted italic")}>
            {displayCopy || "No copy available"}
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-line">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">AdsHunting Signals (Estimated)</h4>
          <div className="grid grid-cols-2 gap-3">
             <div className="rounded-lg bg-zinc-50 border border-line p-3">
                <div className="text-[10px] font-semibold text-muted uppercase">Winner Score</div>
                <div className="mt-1 text-xl font-bold text-ink">
                  {ad.intelligence?.winnerScore != null ? (
                    <>{Math.round(ad.intelligence.winnerScore)}<span className="text-sm font-medium text-muted">/100</span></>
                  ) : (
                    <span className="text-sm font-medium">Not enough data</span>
                  )}
                </div>
             </div>
             <div className="rounded-lg bg-zinc-50 border border-line p-3">
                <div className="text-[10px] font-semibold text-muted uppercase">Signal</div>
                <div className="mt-1 text-sm font-bold text-signal truncate">
                  {Array.isArray(ad.intelligence?.labels) && ad.intelligence!.labels.length > 0
                    ? signalLabel(ad.intelligence!.labels[0], ad)
                    : "Not enough data"}
                </div>
             </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function CreativePreview({
  ad,
  media,
  thumb,
  advertiserName,
}: {
  ad: NormalizedAd;
  media: string | null;
  thumb: string | null;
  advertiserName: string;
}) {
  if (ad.creative.type === "video" && media) {
    return (
      <div className="h-full w-full bg-zinc-950 flex items-center justify-center relative">
        <VideoPreview
          src={media}
          poster={thumb}
          controls={true}
          objectFit="contain"
          className="h-full w-full"
        />
      </div>
    );
  }

  if (ad.creative.type === "carousel" && Array.isArray(ad.creative.carouselItems) && ad.creative.carouselItems.length) {
    const assets = ad.creative.carouselItems.map(item => item.imageUrl || item.videoUrl).filter(Boolean) as string[];
    return (
      <div className="h-full w-full bg-zinc-900 flex items-center justify-center relative">
        <CarouselPreview assets={assets} alt={`Creative from ${advertiserName}`} className="h-full w-full" />
      </div>
    );
  }

  if (media || thumb) {
    return (
      <div className="h-full w-full bg-zinc-900 flex items-center justify-center">
        <img
          src={media || thumb!}
          alt={`Creative from ${advertiserName}`}
          className="h-full w-full object-contain text-transparent"
        />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-zinc-50/80 text-muted">
      <div className="grid size-12 place-items-center rounded-full bg-white shadow-sm border border-line">
        <ImageIcon size={20} className="text-zinc-400" />
      </div>
      <p className="text-xs font-medium">Creative unavailable</p>
    </div>
  );
}
