"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, FolderPlus, ImageIcon, Images, MoreHorizontal, PlaySquare, Share2, Loader2, ChevronDown, FileText, Tag, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui";
import { VideoPreview } from "@/components/video-preview";
import { CarouselPreview } from "@/components/carousel-preview";
import type { NormalizedAd } from "@/lib/types";
import { cn, formatDuration, safeExternalUrl, sanitizeAdCopy } from "@/lib/utils";

// Extracted from original swipe file picker logic for inline use
import { SwipeFilePicker, type SwipeFileResult } from "@/components/swipe-file-picker";

export function AdCard({
  ad,
  saved,
  swipeFileCount = 0,
  onOpen,
  onSave,
  initialCollectionIds = [],
  onSwipeFileAdded,
  onShare,
  hasNote,
  tags,
  onNoteClick,
  onTagsClick,
  onRemoveClick,
}: {
  ad: NormalizedAd;
  saved?: boolean;
  swipeFileCount?: number;
  onOpen: () => void;
  onSave: () => Promise<void> | void;
  initialCollectionIds?: string[];
  onSwipeFileAdded?: (result: SwipeFileResult) => void;
  onShare: () => Promise<void> | void;
  hasNote?: boolean;
  tags?: { id: string; name: string }[];
  onNoteClick?: () => void;
  onTagsClick?: () => void;
  onRemoveClick?: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [sharing] = useState(false);
  const [optimisticSaved, setOptimisticSaved] = useState(false);
  const isSaved = saved || optimisticSaved;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const saveBtnRef = useRef<HTMLDivElement>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  
  // Reset failure states if the ad changes
  useEffect(() => {
    setAvatarFailed(false);
  }, [ad.id]);
  
  const media = safeExternalUrl(ad.sourceMediaUrl);
  const thumb = safeExternalUrl(ad.thumbnailUrl);
  const advertiserProfile = safeExternalUrl(ad.advertiserProfileUrl);
  const landingPage = safeExternalUrl(ad.landingPageUrl);
  const advertiserName = ad.advertiserName || "Unknown advertiser";
  const initial = advertiserName.slice(0, 1).toUpperCase() || "A";

  const displayCopy =
    sanitizeAdCopy(ad.headline) ||
    sanitizeAdCopy(ad.body) ||
    sanitizeAdCopy(ad.description);

  useEffect(() => {
    if (!menuOpen) return;
    function closeOnOutsideClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  return (
    <article className="group flex flex-col w-full overflow-hidden rounded-[12px] border border-line bg-white shadow-sm transition-all duration-200 hover:border-zinc-300 hover:shadow-md">
      {/* Header */}
      <div className="flex h-[52px] items-center gap-2.5 px-3">
        {ad.advertiserAvatarUrl && !avatarFailed ? (
          <img 
            src={ad.advertiserAvatarUrl} 
            alt="" 
            className="size-7 shrink-0 rounded-full border border-line object-cover bg-zinc-50" 
            loading="lazy"
            onError={() => setAvatarFailed(true)}
          />
        ) : (
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-black text-[10px] font-bold text-white">{initial}</span>
        )}
        <div className="flex flex-col min-w-0 flex-1 justify-center">
          <Link
            href={`/brands/${encodeURIComponent(ad.advertiserId)}`}
            onClick={(event) => event.stopPropagation()}
            className="truncate text-[13px] font-semibold text-ink hover:text-signal"
          >
            {advertiserName}
          </Link>
          {ad.platforms.length > 0 && (
            <span className="truncate text-[11px] text-muted">
              {ad.platforms.slice(0, 2).map(titleCase).join(" + ")}
            </span>
          )}
        </div>
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            aria-label="More actions"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="grid size-10 place-items-center rounded-md text-muted hover:bg-zinc-50 transition"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setMenuOpen((current) => !current);
            }}
          >
            <MoreHorizontal size={18} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-11 z-40 w-48 rounded-lg border border-line bg-white p-1 text-xs font-semibold shadow-card" role="menu">
              {advertiserProfile && (
                <a href={advertiserProfile} target="_blank" rel="noreferrer noopener" role="menuitem" onClick={() => setMenuOpen(false)} className="flex min-h-9 items-center gap-2 rounded-md px-2.5 hover:bg-zinc-50">
                  <ExternalLink size={14} />
                  Visit advertiser
                </a>
              )}
              {landingPage && (
                <a href={landingPage} target="_blank" rel="noreferrer noopener" role="menuitem" onClick={() => setMenuOpen(false)} className="flex min-h-9 items-center gap-2 rounded-md px-2.5 hover:bg-zinc-50">
                  <ExternalLink size={14} />
                  Visit landing page
                </a>
              )}
              <button
                type="button"
                role="menuitem"
                disabled={sharing}
                className="flex min-h-9 w-full items-center gap-2 rounded-md px-2.5 text-left hover:bg-zinc-50 disabled:opacity-50"
                onClick={async () => {
                  await onShare();
                  setMenuOpen(false);
                }}
              >
                <Share2 size={14} />
                Copy share link
              </button>
              <button
                type="button"
                role="menuitem"
                className="flex min-h-9 w-full items-center gap-2 rounded-md px-2.5 text-left hover:bg-zinc-50"
                onClick={async () => {
                  await copyText(ad.externalAdId);
                  setMenuOpen(false);
                }}
              >
                <Copy size={14} />
                Copy Ad ID
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Media 4:5 Fixed Viewport */}
      <div className="relative aspect-[4/5] w-full bg-zinc-50 overflow-hidden border-y border-line group-hover:border-zinc-300 transition-colors">
        <div className="absolute inset-0 cursor-pointer" onClick={onOpen} role="button" tabIndex={0} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen()} aria-label={`Open ad by ${advertiserName}`}>
          <CreativePreview ad={ad} media={media} thumb={thumb} advertiserName={advertiserName} />
        </div>
        <div className="pointer-events-none absolute left-2.5 top-2.5 z-10 flex flex-col gap-1.5 items-start">
          <Badge className={cn("px-2 py-1 text-[10px] shadow-sm uppercase font-bold tracking-wider", ad.status === "active" ? "bg-white text-brand border border-line" : "bg-zinc-900 text-white border border-transparent")}>
            {ad.status}
          </Badge>
          {ad.intelligenceLabels && ad.intelligenceLabels[0] && signalLabel(ad.intelligenceLabels[0], ad) && (
            <Badge className="bg-brand text-white border-transparent px-2 py-1 text-[10px] shadow-sm font-semibold">{signalLabel(ad.intelligenceLabels[0], ad)}</Badge>
          )}
        </div>
      </div>

      {/* Primary Action Row */}
      <div className="flex w-full flex-wrap items-center justify-between gap-y-2 gap-x-1 border-b border-line px-2 py-1.5 relative" ref={saveBtnRef}>
        {(ad.variants && ad.variants > 1) ? (
          <button
            type="button"
            onClick={onOpen}
            className="flex min-h-[32px] shrink-0 items-center justify-center rounded-md bg-brand-soft px-2.5 text-[12px] font-[650] text-brand transition hover:bg-brand/10 hover:text-brand-active"
            aria-label={`View ${ad.variants} variants`}
          >
            {ad.variants} Variants
          </button>
        ) : <div className="hidden sm:block flex-1" />}
        
        <div className="flex items-center gap-1 shrink-0 ml-auto">
          <div className="flex items-center">
            <button 
              type="button"
              disabled={isSaved || saving}
              onClick={async () => {
                 if (saving || isSaved) return;
                 setOptimisticSaved(true);
                 setSaving(true);
                 try { await onSave(); } catch { setOptimisticSaved(false); } finally { setSaving(false); }
              }}
              className={cn("flex min-h-[32px] shrink-0 items-center gap-1.5 rounded-l-md px-2.5 text-xs font-semibold transition disabled:opacity-100", (isSaved || swipeFileCount > 0) ? "bg-brand/10 text-brand-active" : "text-muted hover:bg-zinc-50 hover:text-ink")}
              aria-label={isSaved ? "Saved" : "Save to Saved Ads"}
            >
              {saving ? <Loader2 size={14} className="shrink-0 animate-spin" /> : (isSaved || swipeFileCount > 0) ? <Check size={14} className="shrink-0" /> : <FolderPlus size={14} className="shrink-0" />}
              <span className="hidden sm:inline">
                {saving ? "Saving..." : (isSaved || swipeFileCount > 0) ? "Saved" : "Save"}
              </span>
            </button>
            {!(isSaved || swipeFileCount > 0) && (
              <button
                type="button"
                onClick={() => setShowPicker(true)}
                className="flex min-h-[32px] w-7 shrink-0 items-center justify-center rounded-r-md border-l border-line/50 bg-transparent text-muted hover:bg-zinc-50 hover:text-ink transition"
                aria-label="Choose Swipe File"
                aria-expanded={showPicker}
              >
                <ChevronDown size={14} />
              </button>
            )}
          </div>
          
          <button
            type="button"
            onClick={async (e) => {
               e.preventDefault();
               await onShare();
            }}
            className="flex min-h-[32px] px-2 shrink-0 items-center gap-1.5 rounded-md text-xs font-semibold text-muted hover:bg-zinc-50 hover:text-ink transition"
            aria-label="Share creative"
          >
            <Share2 size={14} className="opacity-80" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex flex-col border-t border-line px-3 py-3">
        <h3 className={cn("line-clamp-2 text-[13px] leading-5 font-medium min-h-[40px]", displayCopy ? "text-ink" : "text-muted")}>
          {displayCopy || "Copy unavailable"}
        </h3>

        <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px] font-medium text-muted">
          <span className="truncate">{formatDuration(ad.runningDays)}</span>
          <span className="inline-flex shrink-0 items-center gap-1.5 capitalize">
            {ad.mediaType === "video" ? <PlaySquare size={13} /> : ad.mediaType === "carousel" ? <Images size={13} /> : <ImageIcon size={13} />}
            {ad.mediaType}
          </span>
        </div>
      </div>
      
      {/* Footer Actions (Optional) */}
      {(onNoteClick || onTagsClick || onRemoveClick) && (
        <div className="flex w-full min-h-[44px] border-t border-line items-center px-2">
          {onNoteClick && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onNoteClick(); }}
              className={cn("flex flex-1 items-center justify-center gap-1.5 px-2 py-2 text-[12px] font-semibold transition rounded-md", hasNote ? "text-ink bg-zinc-50 hover:bg-zinc-100" : "text-muted hover:bg-zinc-50 hover:text-ink")}
              aria-label="Notes"
            >
              <FileText size={14} className={hasNote ? "text-signal" : ""} /> Note {hasNote && <span className="text-signal font-bold">&bull;</span>}
            </button>
          )}
          
          {onTagsClick && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onTagsClick(); }}
              className={cn("flex flex-1 items-center justify-center gap-1.5 px-2 py-2 text-[12px] font-semibold transition rounded-md", (tags && tags.length > 0) ? "text-ink bg-zinc-50 hover:bg-zinc-100" : "text-muted hover:bg-zinc-50 hover:text-ink")}
              aria-label="Tags"
            >
              <Tag size={14} className={(tags && tags.length > 0) ? "text-signal" : ""} />
              Tags
              {tags && tags.length > 0 && (
                <div className="flex items-center gap-1 ml-1">
                   {tags.slice(0, 2).map(t => (
                      <span key={t.id} className="inline-flex h-[20px] items-center rounded-sm bg-zinc-200/50 px-1.5 text-[10px] font-semibold text-zinc-700 truncate max-w-[60px]">{t.name}</span>
                   ))}
                   {tags.length > 2 && <span className="text-[10px] text-zinc-500 font-bold">+{tags.length - 2}</span>}
                </div>
              )}
            </button>
          )}

          {onRemoveClick && (
            <div className="flex shrink-0 items-center border-l border-line ml-1 pl-1">
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemoveClick(); }}
                className="grid size-9 place-items-center rounded-md text-muted hover:bg-zinc-50 hover:text-signal transition group/trash"
                title="Remove from Saved Ads"
                aria-label="Remove from Saved Ads"
              >
                <Trash2 size={15} className="group-hover/trash:text-signal" />
              </button>
            </div>
          )}
        </div>
      )}
      
      {showPicker && (
        <SwipeFilePicker
          ad={ad}
          saved={saved}
          initialCollectionIds={initialCollectionIds}
          anchorRef={saveBtnRef}
          onClose={() => setShowPicker(false)}
          onAdded={onSwipeFileAdded}
        />
      )}
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
  if (ad.mediaType === "video" && media) {
    return <VideoCreativePreview src={media} poster={thumb} />;
  }

  if (ad.mediaType === "carousel" && ad.carouselAssets.length) {
    return <CarouselCreativePreview assets={ad.carouselAssets} alt={`Creative from ${advertiserName}`} />;
  }

  if (media || thumb) {
    return <ImageCreativePreview src={media || thumb!} alt={`Creative from ${advertiserName}`} />;
  }

  // Fallback
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-zinc-50 text-muted">
      <div className="grid size-12 place-items-center rounded-full bg-white shadow-sm border border-line">
        <ImageIcon size={20} className="text-zinc-400" />
      </div>
      <p className="text-[13px] font-semibold text-ink">Creative unavailable</p>
      <p className="text-[11px] font-medium text-center px-6 max-w-[200px]">The source did not provide preview media for this ad.</p>
    </div>
  );
}

function VideoCreativePreview({ src, poster }: { src: string; poster: string | null }) {
  // Always object-fit: contain to avoid cutting off essential creative on vertical ads inside a 4:5 box
  return (
    <div className="h-full w-full bg-zinc-950 flex items-center justify-center relative">
      <VideoPreview
        src={src}
        poster={poster}
        objectFit="contain"
        className="h-full w-full"
      />
    </div>
  );
}

function ImageCreativePreview({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  
  if (failed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-zinc-50/80 text-muted">
        <div className="grid size-12 place-items-center rounded-full bg-white shadow-sm border border-line">
          <ImageIcon size={20} className="text-zinc-400" />
        </div>
        <p className="text-xs font-medium">Creative unavailable</p>
      </div>
    );
  }
  
  return (
    <div className="h-full w-full bg-zinc-900 flex items-center justify-center">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-full w-full object-contain text-transparent"
      />
    </div>
  );
}

function CarouselCreativePreview({ assets, alt }: { assets: string[]; alt: string }) {
  // Using the existing CarouselPreview component but constraining it
  return (
    <div className="h-full w-full bg-zinc-900 flex items-center justify-center relative">
      <CarouselPreview assets={assets} alt={alt} className="h-full w-full" />
    </div>
  );
}

function signalLabel(label: string, ad: NormalizedAd) {
  if (label === "High-Confidence Winner") return "Exceptional";
  if (label === "Proven Long Runner") return "Long Runner";
  if (label === "Emerging Winner") return "Promising";
  if (label === "Standard") return ad.winnerScore >= 70 ? "Strong Signal" : ad.winnerScore >= 55 ? "Promising" : "Testing";
  if (label === "Testing") return "Testing";
  return label.replace(/\(.+\)/, "").trim();
}

function titleCase(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const field = document.createElement("textarea");
    field.value = value;
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    document.execCommand("copy");
    document.body.removeChild(field);
  }
}
