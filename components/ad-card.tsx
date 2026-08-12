"use client";

import type { Dispatch, RefObject, SetStateAction } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bookmark, Check, Copy, ExternalLink, FolderPlus, ImageIcon, Images, MoreHorizontal, PlaySquare, Share2 } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import { VideoPreview } from "@/components/video-preview";
import { CarouselPreview } from "@/components/carousel-preview";
import type { NormalizedAd } from "@/lib/types";
import { cn, formatDate, formatDuration, safeExternalUrl, sanitizeAdCopy } from "@/lib/utils";

export function AdCard({
  ad,
  saved,
  swipeFileCount = 0,
  variant = "standard",
  onOpen,
  onSave,
  onSwipeFile,
  onShare,
}: {
  ad: NormalizedAd;
  saved?: boolean;
  swipeFileCount?: number;
  variant?: "standard" | "masonry";
  onOpen: () => void;
  onSave: () => Promise<void> | void;
  onSwipeFile: () => void;
  onShare: () => Promise<void> | void;
}) {
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const media = safeExternalUrl(ad.sourceMediaUrl);
  const thumb = safeExternalUrl(ad.thumbnailUrl);
  const advertiserProfile = safeExternalUrl(ad.advertiserProfileUrl);
  const landingPage = safeExternalUrl(ad.landingPageUrl);
  const advertiserName = ad.advertiserName || "Unknown advertiser";
  const initial = advertiserName.slice(0, 1).toUpperCase() || "A";

  const displayCopy =
    sanitizeAdCopy(ad.headline) ||
    sanitizeAdCopy(ad.body) ||
    sanitizeAdCopy(ad.description) ||
    "Ad copy not available";

  useEffect(() => {
    if (!menuOpen) return;

    function closeOnOutsideClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
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

  if (variant === "masonry") {
    return (
      <MasonryAdCard
        ad={ad}
        media={media}
        thumb={thumb}
        advertiserName={advertiserName}
        advertiserProfile={advertiserProfile}
        landingPage={landingPage}
        initial={initial}
        displayCopy={displayCopy}
        saved={saved}
        swipeFileCount={swipeFileCount}
        saving={saving}
        sharing={sharing}
        menuOpen={menuOpen}
        menuRef={menuRef}
        setMenuOpen={setMenuOpen}
        setSaving={setSaving}
        setSharing={setSharing}
        onOpen={onOpen}
        onSave={onSave}
        onSwipeFile={onSwipeFile}
        onShare={onShare}
      />
    );
  }

  return (
    <Card className="group overflow-hidden transition hover:border-zinc-300 hover:shadow-md">
      <div className="relative block overflow-hidden bg-zinc-50 text-left">
        <CreativePreview ad={ad} media={media} thumb={thumb} advertiserName={advertiserName} />
        <button type="button" onClick={onOpen} className="absolute inset-0 z-10 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-signal" aria-label={`Open ad by ${advertiserName}`} />
        <span className="pointer-events-none absolute left-3 top-3 z-20">
          <Badge tone={ad.status === "active" ? "red" : "dark"} className="px-2 py-1 text-[10px]">
            <span
              className={`mr-1.5 size-1.5 rounded-full ${
                ad.status === "active" ? "bg-signal" : "bg-white"
              }`}
            />
            {ad.status.toUpperCase()}
          </Badge>
        </span>
        {ad.intelligenceLabels[0] && (
          <span className="pointer-events-none absolute right-3 top-3 z-20">
            <Badge className="bg-white/90 px-2 py-1 text-[10px] text-ink shadow-sm backdrop-blur">{signalLabel(ad.intelligenceLabels[0], ad)}</Badge>
          </span>
        )}
      </div>

      <div className="flex min-h-[260px] flex-col p-4">
        <div className="flex items-start gap-3">
          {ad.advertiserAvatarUrl ? (
            <img
              src={ad.advertiserAvatarUrl}
              alt=""
              className="size-9 rounded-full border border-line object-cover"
              loading="lazy"
            />
          ) : (
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-black text-xs font-bold text-white">
              {initial}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <Link
              href={`/brands/${encodeURIComponent(ad.advertiserId)}`}
              onClick={(event) => event.stopPropagation()}
              className="block truncate text-sm font-semibold hover:text-signal"
            >
              {advertiserName}
            </Link>
            <p className="mt-0.5 truncate text-[11px] font-medium text-muted">{brandDescriptor(ad)}</p>
          </div>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-label="More actions"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="grid size-9 place-items-center rounded-md text-muted hover:bg-zinc-50"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setMenuOpen((current) => !current);
              }}
            >
              <MoreHorizontal size={17} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-10 z-40 w-48 rounded-lg border border-line bg-white p-1 text-xs font-semibold shadow-card" role="menu">
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
                  className="flex min-h-9 w-full items-center gap-2 rounded-md px-2.5 text-left hover:bg-zinc-50"
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

        <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-ink">{displayCopy}</p>

        <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs">
          <div>
            <p className="font-semibold text-ink">
              Running {formatDuration(ad.runningDays).toLowerCase()}
            </p>
            <p className="mt-1 text-muted">
              Started {ad.startDate ? formatDate(ad.startDate) : "—"}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-muted">
            {ad.mediaType === "video" ? <PlaySquare size={15} /> : ad.mediaType === "carousel" ? <Images size={15} /> : <ImageIcon size={15} />}
            <span className="capitalize">{ad.mediaType}</span>
          </div>
        </div>

        <div className="mt-auto pt-4">
          <Button type="button" variant="primary" onClick={onOpen} className="w-full px-3">
            Open Ad
          </Button>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            <button
              type="button"
              title="Save this ad to your research"
              aria-label={saved ? "Ad saved" : "Save this ad"}
              disabled={saving || saved}
              onClick={async () => {
                if (saved) return;
                setSaving(true);
                try {
                  await onSave();
                } finally {
                  setSaving(false);
                }
              }}
              className={cn(
                "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border px-2 text-xs font-semibold transition disabled:cursor-default",
                saved ? "border-red-100 bg-red-50 text-signal" : "border-line bg-white text-ink hover:bg-zinc-50"
              )}
            >
              {saving ? <LoaderDot /> : saved ? <Check size={14} /> : <Bookmark size={14} />}
              <span>{saving ? "Saving" : saved ? "Saved" : "Save"}</span>
            </button>
            <button
              type="button"
              title="Add this creative to a Swipe File"
              onClick={onSwipeFile}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-line bg-white px-2 text-xs font-semibold text-ink transition hover:bg-zinc-50"
            >
              <FolderPlus size={14} />
              <span>{swipeFileCount > 0 ? `${swipeFileCount} Files` : "Swipe File"}</span>
            </button>
            <button
              type="button"
              title="Copy a protected Runlytics share link"
              aria-label="Share ad"
              disabled={sharing}
              onClick={async () => {
                setSharing(true);
                try {
                  await onShare();
                } finally {
                  setSharing(false);
                }
              }}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-line bg-white px-2 text-xs font-semibold text-ink transition hover:bg-zinc-50 disabled:opacity-60"
            >
              {sharing ? <LoaderDot /> : <Share2 size={14} />}
              <span>{sharing ? "Sharing" : "Share"}</span>
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function MasonryAdCard({
  ad,
  media,
  thumb,
  advertiserName,
  advertiserProfile,
  landingPage,
  initial,
  displayCopy,
  saved,
  swipeFileCount,
  saving,
  sharing,
  menuOpen,
  menuRef,
  setMenuOpen,
  setSaving,
  setSharing,
  onOpen,
  onSave,
  onSwipeFile,
  onShare,
}: {
  ad: NormalizedAd;
  media: string | null;
  thumb: string | null;
  advertiserName: string;
  advertiserProfile: string | null;
  landingPage: string | null;
  initial: string;
  displayCopy: string;
  saved?: boolean;
  swipeFileCount: number;
  saving: boolean;
  sharing: boolean;
  menuOpen: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
  setSaving: Dispatch<SetStateAction<boolean>>;
  setSharing: Dispatch<SetStateAction<boolean>>;
  onOpen: () => void;
  onSave: () => Promise<void> | void;
  onSwipeFile: () => void;
  onShare: () => Promise<void> | void;
}) {
  return (
    <article className="mb-3 inline-block w-full break-inside-avoid overflow-hidden rounded-[10px] border border-line bg-white align-top transition hover:border-zinc-300">
      <div className="flex min-h-12 items-center gap-2.5 px-2.5 py-2">
        {ad.advertiserAvatarUrl ? (
          <img src={ad.advertiserAvatarUrl} alt="" className="size-7 rounded-full border border-line object-cover" loading="lazy" />
        ) : (
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-black text-[10px] font-bold text-white">{initial}</span>
        )}
        <Link
          href={`/brands/${encodeURIComponent(ad.advertiserId)}`}
          onClick={(event) => event.stopPropagation()}
          className="min-w-0 flex-1 truncate text-xs font-semibold text-ink hover:text-signal"
        >
          {advertiserName}
        </Link>
        <MoreActionsMenu
          ad={ad}
          saved={saved}
          saving={saving}
          sharing={sharing}
          advertiserProfile={advertiserProfile}
          landingPage={landingPage}
          menuOpen={menuOpen}
          menuRef={menuRef}
          setMenuOpen={setMenuOpen}
          setSaving={setSaving}
          setSharing={setSharing}
          onSave={onSave}
          onShare={onShare}
        />
      </div>

      <div className="relative bg-zinc-50">
        <div className="cursor-pointer" onClick={onOpen} role="button" tabIndex={0} onKeyDown={(event) => (event.key === "Enter" || event.key === " ") && onOpen()}>
          <CreativePreview ad={ad} media={media} thumb={thumb} advertiserName={advertiserName} />
        </div>
        <span className="pointer-events-none absolute left-2 top-2 z-20">
          <Badge tone={ad.status === "active" ? "red" : "dark"} className="px-2 py-1 text-[9px]">
            {ad.status.toUpperCase()}
          </Badge>
        </span>
        {ad.intelligenceLabels[0] && (
          <span className="pointer-events-none absolute right-2 top-2 z-20">
            <Badge className="bg-white/90 px-2 py-1 text-[9px] text-ink shadow-sm">{signalLabel(ad.intelligenceLabels[0], ad)}</Badge>
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onSwipeFile}
        title="Add this creative to a Swipe File"
        className="flex min-h-11 w-full items-center justify-between gap-2 border-t border-line px-3 text-left text-xs font-semibold text-ink transition hover:bg-zinc-50"
      >
        <span className="inline-flex min-w-0 items-center gap-2">
          <FolderPlus size={15} className="shrink-0 text-signal" />
          <span className="truncate">{swipeFileCount > 0 ? `${swipeFileCount} Swipe Files` : "Save to Swipe File"}</span>
        </span>
        <ChevronGlyph />
      </button>

      <div className="border-t border-line px-3 py-2">
        <p className="line-clamp-1 text-[11px] leading-4 text-muted">{displayCopy}</p>
        <div className="mt-1.5 flex items-center justify-between gap-2 text-[10px] font-medium text-muted">
          <span className="truncate">{formatDuration(ad.runningDays)}</span>
          <span className="inline-flex shrink-0 items-center gap-1 capitalize">
            {ad.mediaType === "video" ? <PlaySquare size={12} /> : ad.mediaType === "carousel" ? <Images size={12} /> : <ImageIcon size={12} />}
            {ad.mediaType}
          </span>
        </div>
      </div>
    </article>
  );
}

function MoreActionsMenu({
  ad,
  saved,
  saving,
  sharing,
  advertiserProfile,
  landingPage,
  menuOpen,
  menuRef,
  setMenuOpen,
  setSaving,
  setSharing,
  onSave,
  onShare,
}: {
  ad: NormalizedAd;
  saved?: boolean;
  saving: boolean;
  sharing: boolean;
  advertiserProfile: string | null;
  landingPage: string | null;
  menuOpen: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
  setSaving: Dispatch<SetStateAction<boolean>>;
  setSharing: Dispatch<SetStateAction<boolean>>;
  onSave: () => Promise<void> | void;
  onShare: () => Promise<void> | void;
}) {
  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        className="grid size-8 place-items-center rounded-md text-muted hover:bg-zinc-50"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setMenuOpen((current) => !current);
        }}
      >
        <MoreHorizontal size={16} />
      </button>
      {menuOpen && (
        <div className="absolute right-0 top-9 z-40 w-48 rounded-lg border border-line bg-white p-1 text-xs font-semibold shadow-card" role="menu">
          <button
            type="button"
            role="menuitem"
            disabled={saving || saved}
            className="flex min-h-9 w-full items-center gap-2 rounded-md px-2.5 text-left hover:bg-zinc-50 disabled:opacity-60"
            onClick={async () => {
              if (saved) return;
              setSaving(true);
              try {
                await onSave();
              } finally {
                setSaving(false);
                setMenuOpen(false);
              }
            }}
          >
            {saved ? <Check size={14} /> : <Bookmark size={14} />}
            {saving ? "Saving..." : saved ? "Saved" : "Save"}
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={sharing}
            className="flex min-h-9 w-full items-center gap-2 rounded-md px-2.5 text-left hover:bg-zinc-50 disabled:opacity-60"
            onClick={async () => {
              setSharing(true);
              try {
                await onShare();
              } finally {
                setSharing(false);
                setMenuOpen(false);
              }
            }}
          >
            <Share2 size={14} />
            {sharing ? "Sharing..." : "Copy share link"}
          </button>
          {landingPage && (
            <a href={landingPage} target="_blank" rel="noreferrer noopener" role="menuitem" onClick={() => setMenuOpen(false)} className="flex min-h-9 items-center gap-2 rounded-md px-2.5 hover:bg-zinc-50">
              <ExternalLink size={14} />
              Visit landing page
            </a>
          )}
          {advertiserProfile && (
            <a href={advertiserProfile} target="_blank" rel="noreferrer noopener" role="menuitem" onClick={() => setMenuOpen(false)} className="flex min-h-9 items-center gap-2 rounded-md px-2.5 hover:bg-zinc-50">
              <ExternalLink size={14} />
              Visit advertiser
            </a>
          )}
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

  return (
    <div className="grid aspect-[4/5] w-full place-items-center bg-zinc-50 text-muted">
      <ImageIcon size={28} strokeWidth={1.5} />
    </div>
  );
}

function VideoCreativePreview({ src, poster }: { src: string; poster: string | null }) {
  const [ratio, setRatio] = useState<number | null>(null);
  const orientation = orientationFromRatio(ratio);

  return (
    <div className="bg-zinc-950 p-0">
      <div
        className={cn(
          "relative mx-auto w-full overflow-hidden bg-black",
          orientation === "portrait" && "aspect-[9/16]",
          orientation === "landscape" && "aspect-video",
          orientation === "square" && "aspect-square"
        )}
        style={ratio ? { aspectRatio: `${ratio}` } : undefined}
      >
        <VideoPreview
          src={src}
          poster={poster}
          objectFit="contain"
          className="h-full w-full"
          onMetadata={({ width, height }) => setRatio(width / height)}
        />
      </div>
    </div>
  );
}

function ImageCreativePreview({ src, alt }: { src: string; alt: string }) {
  const [ratio, setRatio] = useState<number | null>(null);

  return (
    <div
      className="relative w-full overflow-hidden bg-zinc-50"
      style={{ aspectRatio: ratio ? `${ratio}` : "4 / 5" }}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.01]"
        onLoad={(event) => {
          const image = event.currentTarget;
          if (image.naturalWidth && image.naturalHeight) {
            setRatio(image.naturalWidth / image.naturalHeight);
          }
        }}
      />
    </div>
  );
}

function CarouselCreativePreview({ assets, alt }: { assets: string[]; alt: string }) {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden bg-zinc-50">
      <CarouselPreview assets={assets} alt={alt} className="h-full w-full" />
      <span className="pointer-events-none absolute left-3 bottom-3 z-20 rounded-full bg-white px-2 py-1 text-[10px] font-bold uppercase text-ink shadow-sm">
        Carousel
      </span>
    </div>
  );
}

function orientationFromRatio(ratio: number | null) {
  if (!ratio) return "portrait";
  if (ratio > 1.15) return "landscape";
  if (ratio < 0.9) return "portrait";
  return "square";
}

function signalLabel(label: string, ad: NormalizedAd) {
  if (label === "High-Confidence Winner") return "Exceptional";
  if (label === "Proven Long Runner") return "Long Runner";
  if (label === "Emerging Winner") return "Promising";
  if (label === "Standard") return ad.winnerScore >= 70 ? "Strong Signal" : ad.winnerScore >= 55 ? "Promising" : "Testing";
  if (label === "Testing") return "Testing";
  return label.replace(/\(.+\)/, "").trim();
}

function brandDescriptor(ad: NormalizedAd) {
  const caption = sanitizeAdCopy(ad.caption);
  if (caption && caption.length <= 42 && caption !== ad.body && caption !== ad.headline) return caption;
  if (ad.platforms.length) return ad.platforms.slice(0, 2).map(titleCase).join(" + ");
  if (ad.country) return `Meta page · ${ad.country}`;
  return "Meta advertiser";
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

function LoaderDot() {
  return <span className="size-3 animate-pulse rounded-full bg-current" aria-hidden />;
}

function ChevronGlyph() {
  return <span className="shrink-0 text-muted" aria-hidden>▾</span>;
}
