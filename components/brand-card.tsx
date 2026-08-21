"use client";

import Link from "next/link";
import { type BrandSummary } from "@/lib/brand-data";
import { ChevronRight } from "lucide-react";
import { safeExternalUrl } from "@/lib/utils";

export function BrandCard({ brand }: { brand: BrandSummary }) {
  const initial = brand.name?.slice(0, 1).toUpperCase() || "B";
  const avatar = safeExternalUrl(brand.avatar);

  return (
    <article className="group flex flex-col w-full overflow-hidden rounded-[16px] border border-line bg-white shadow-sm transition-all duration-200 hover:border-brand-border hover:shadow-md h-[300px]">
      <div className="flex flex-col p-4 flex-1">
        {/* Header */}
        <div className="flex items-center gap-3">
          {avatar ? (
            <img 
              src={avatar} 
              alt={brand.name} 
              className="size-10 shrink-0 rounded-full border border-line object-cover bg-zinc-50" 
              loading="lazy"
            />
          ) : (
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-black text-xs font-bold text-white">{initial}</span>
          )}
          <div className="flex flex-col min-w-0 flex-1">
            <h3 className="truncate text-[15px] font-semibold text-ink">
              {brand.name}
            </h3>
            <p className="truncate text-xs text-muted">
              Advertiser
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 mb-4">
          <div className="flex gap-1.5 items-baseline">
            <span className="text-[15px] font-semibold text-brand">{brand.activeUnique}</span>
            <span className="text-xs text-muted">Active Ads</span>
          </div>
          <div className="flex gap-1.5 items-baseline">
            <span className="text-[15px] font-semibold text-ink">{brand.totalUnique}</span>
            <span className="text-xs text-muted">Total Ads</span>
          </div>
        </div>

        {/* Creatives Preview */}
        <div className="flex gap-1.5 mb-4">
          {brand.previewThumbs?.slice(0, 3).map((thumb, i) => (
            <div key={i} className="flex-1 relative aspect-[4/5] bg-zinc-100 rounded-md overflow-hidden border border-line/50">
               <img src={safeExternalUrl(thumb) || ""} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
          {Array.from({ length: Math.max(0, 3 - (brand.previewThumbs?.length || 0)) }).map((_, i) => (
            <div key={`empty-${i}`} className="flex-1 relative aspect-[4/5] bg-zinc-50 rounded-md border border-line/50" />
          ))}
        </div>

        {/* Platforms */}
        <p className="truncate text-[13px] text-muted mb-4 mt-auto">
          {brand.platforms?.length > 0 ? brand.platforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" · ") : "Cross Platform"}
        </p>
        
        {/* Action */}
        <Link 
          href={`/brands/${encodeURIComponent(brand.id)}`}
          className="flex items-center gap-1.5 text-[13px] font-semibold text-ink transition group-hover:text-brand mt-auto"
        >
          View Brand <ChevronRight size={14} className="opacity-70" />
        </Link>
      </div>
    </article>
  );
}
