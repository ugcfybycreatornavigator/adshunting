"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { safeExternalUrl } from "@/lib/utils";

export function CarouselPreview({ assets, alt, className = "" }: { assets: string[]; alt: string; className?: string }) {
  const safeAssets = assets.map(safeExternalUrl).filter((asset): asset is string => Boolean(asset));
  const [index, setIndex] = useState(0);
  const current = safeAssets[index];
  const move = (event: React.MouseEvent, direction: number) => {
    event.stopPropagation();
    event.preventDefault();
    setIndex((value) => (value + direction + safeAssets.length) % safeAssets.length);
  };
  if (!current) return <span className={`grid place-items-center bg-surface text-muted ${className}`}><ImageIcon /></span>;
  return (
    <div className={`relative overflow-hidden bg-surface ${className}`}>
      <img src={current} alt={`${alt}, item ${index + 1} of ${safeAssets.length}`} loading="lazy" className="h-full w-full object-contain" />
      {safeAssets.length > 1 && <>
        <button type="button" onClick={(event) => move(event, -1)} aria-label="Previous carousel item" className="absolute left-2 top-1/2 z-20 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black/70 text-white focus-visible:ring-2 focus-visible:ring-white"><ChevronLeft size={18} /></button>
        <button type="button" onClick={(event) => move(event, 1)} aria-label="Next carousel item" className="absolute right-2 top-1/2 z-20 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black/70 text-white focus-visible:ring-2 focus-visible:ring-white"><ChevronRight size={18} /></button>
        <span className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/65 px-2 py-1 text-[10px] font-semibold text-white">{index + 1} / {safeAssets.length}</span>
      </>}
    </div>
  );
}
