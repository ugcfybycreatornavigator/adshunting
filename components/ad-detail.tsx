"use client";

import { useState } from "react";
import Link from "next/link";
import { BarChart3, Bookmark, Check, ExternalLink, ImageIcon, Info, Loader2, MousePointerClick, Target, Users, X } from "lucide-react";
import { VideoPreview } from "@/components/video-preview";
import { CarouselPreview } from "@/components/carousel-preview";
import type { NormalizedAd } from "@/lib/types";
import { cn, formatDate, safeExternalUrl } from "@/lib/utils";
import { computeAdIntelligence } from "@/lib/intelligence";
import { BRAND } from "@/lib/brand";

export function AdDetailDrawer({
  ad,
  saved = false,
  onClose,
  onSave,
}: {
  ad: NormalizedAd;
  saved?: boolean;
  onClose: () => void;
  onSave: () => Promise<void> | void;
}) {
  const [optimisticSaved, setOptimisticSaved] = useState(saved);
  const [saving, setSaving] = useState(false);
  const media = safeExternalUrl(ad.creative.videoUrl || ad.creative.imageUrl);
  const intelligence = computeAdIntelligence({ startDate: ad.delivery.startedAt, stopDate: ad.delivery.endedAt, status: ad.delivery.status, lastSeenAt: ad.provider.fetchedAt, variants: ad.variants || 1, creativeRepetition: 0, platforms: ad.delivery.platforms, mediaType: ad.creative.type, headline: ad.copy.headline, body: ad.copy.primaryText, cta: ad.copy.cta, landingPageUrl: ad.destination.url, sourceMediaUrl: ad.creative.imageUrl || ad.creative.videoUrl, advertiserId: ad.advertiser.id });
  const isSaved = saved || optimisticSaved;

  async function handleSave() {
    if (isSaved || saving) return;
    setOptimisticSaved(true);
    setSaving(true);
    try {
      await onSave();
    } catch {
      setOptimisticSaved(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/25 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label={`Ad details for ${ad.advertiser.name}`} onMouseDown={onClose}>
      <div className="absolute inset-0 overflow-y-auto bg-white md:left-auto md:w-[min(94vw,1100px)] md:border-l md:border-line md:shadow-2xl" onMouseDown={event => event.stopPropagation()}>
        
        {/* Toolbar */}
        <header className="sticky top-0 z-10 flex min-h-[64px] items-center justify-between border-b border-line/60 bg-white/95 px-4 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <button onClick={onClose} className="grid size-10 shrink-0 place-items-center rounded-xl border border-line/80 text-ink transition-colors hover:bg-zinc-50" aria-label="Close details">
              <X size={18} />
            </button>
            <div className="min-w-0 flex flex-col justify-center">
              <p className="truncate text-[15px] font-[600] text-ink leading-snug">{ad.advertiser.name || "Unknown advertiser"}</p>
              <p className="truncate text-[12px] text-muted leading-tight mt-0.5">Library ID {ad.externalId || ad.id}</p>
            </div>
          </div>
          <button 
            onClick={handleSave} 
            disabled={isSaved || saving} 
            aria-label={isSaved ? "Saved" : "Save to Saved Ads"}
            className={cn(
              "flex items-center justify-center gap-2 h-10 px-4 rounded-[12px] text-[14px] font-[600] transition-all duration-150 shadow-sm",
              isSaved || saving 
                ? "bg-zinc-100 text-muted cursor-not-allowed shadow-none" 
                : "bg-brand text-white hover:bg-brand-strong"
            )}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : isSaved ? <Check size={16} /> : <Bookmark size={16} />}
            {saving ? "Saving" : isSaved ? "Saved" : "Save"}
          </button>
        </header>

        {/* Main Content Grid */}
        <div className="grid gap-[28px] p-4 sm:p-6 lg:p-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(350px,1fr)] max-w-[1400px] mx-auto">
          
          {/* Left Column: Creative & Copy */}
          <div className="flex flex-col gap-[28px]">
            <section>
              <SectionHeader number="01" title="Creative" />
              <DetailCreativePreview ad={ad} media={media} />
            </section>

            <section>
              <SectionHeader number="02" title="Copy" />
              <div className="mt-4 rounded-[16px] border border-[#E8EAE7] bg-white divide-y divide-[#E8EAE7]">
                <CopyMeta label="Body copy" value={ad.copy.primaryText} wide />
                <CopyMeta label="Headline" value={ad.copy.headline} />
                <CopyMeta label="Description" value={ad.copy.description} />
                <CopyMeta label="Call to action" value={ad.copy.cta} />
                <CopyMeta label="Hashtags" value={null} wide />
              </div>
            </section>

            {ad.creative.carouselItems && ad.creative.carouselItems.length > 1 && (
              <section>
                <SectionHeader number="02b" title="Carousel Cards" />
                <div className="mt-4 space-y-4">
                  {ad.creative.carouselItems.map((card, i) => (
                    <div key={i} className="rounded-[16px] border border-[#E8EAE7] bg-white divide-y divide-[#E8EAE7]">
                      <div className="px-5 py-3 bg-zinc-50/50 rounded-t-[16px]">
                        <p className="text-[13px] font-[650] text-ink uppercase tracking-wide">Card {i + 1}</p>
                      </div>
                      <CopyMeta label="Headline" value={card.headline} />
                      <CopyMeta label="Destination" value={card.destinationUrl} wide />
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <SectionHeader number="03" title="Landing page" />
              <div className="mt-4 rounded-[16px] border border-[#E8EAE7] bg-white p-5">
                {ad.destination.url ? (
                  <a href={ad.destination.url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-4 text-sm font-[500] text-ink hover:text-brand transition-colors">
                    <span className="truncate">{ad.destination.url}</span>
                    <ExternalLink className="shrink-0 text-muted" size={16} />
                  </a>
                ) : (
                  <p className="text-[14px] text-muted">Not available from data provider</p>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Intelligence & Delivery */}
          <aside className="flex flex-col gap-[28px]">
            <section>
              <SectionHeader number="04" title={`${BRAND.name} Signals`} />
              <div className="mt-4">
                <AdsHuntingSignalsPanel ad={ad} intelligence={intelligence} />
              </div>

              {ad.intelligence.labels.length > 0 && (
                <div className="mt-[16px] flex flex-wrap gap-[8px]">
                  {ad.intelligence.labels.map((label: string) => (
                    <span key={label} className="inline-flex items-center h-[28px] px-3 rounded-full bg-brand/10 border border-brand/20 text-[12px] font-[600] text-[#4F9625]">
                      {displaySignalLabel(label, ad.intelligence.winnerScore ?? 0)}
                    </span>
                  ))}
                </div>
              )}
            </section>

            <section>
              <SectionHeader number="05" title="Delivery" />
              <div className="mt-4 rounded-[16px] border border-[#E8EAE7] bg-white">
                <DeliveryMeta label="Status" value={ad.delivery.status.toUpperCase()} />
                <DeliveryMeta label="Started running" value={ad.delivery.startedAt ? formatDate(ad.delivery.startedAt) : null} />
                <DeliveryMeta label="Stopped running" value={ad.delivery.endedAt ? formatDate(ad.delivery.endedAt) : ad.delivery.status === "active" ? "Still active" : null} />
                <DeliveryMeta label="First seen" value={formatDate(ad.provider.fetchedAt)} />
                <DeliveryMeta label="Last checked" value={formatDate(ad.provider.fetchedAt)} />
                <DeliveryMeta label="Country" value={ad.delivery.countries[0]} />
                <DeliveryMeta label="Platforms" value={ad.delivery.platforms?.length ? ad.delivery.platforms.map(titleCase).join(", ") : null} />
                <DeliveryMeta label="Archive Status" value="Source Hosted" noBorder />
              </div>
            </section>

            <section>
              <SectionHeader number="06" title="Audience / Demographics" />
              <DemographicsPanel demographics={null} />
            </section>

            <section>
              <SectionHeader number="07" title="Advertiser" />
              <div className="mt-4 rounded-[16px] border border-[#E8EAE7] bg-white p-5 flex items-center gap-4">
                {ad.advertiser.logoUrl ? (
                  <img src={ad.advertiser.logoUrl} alt="" className="size-[48px] rounded-full border border-line/60" />
                ) : (
                  <span className="grid size-[48px] place-items-center rounded-full bg-ink font-[600] text-white text-[18px]">
                    {ad.advertiser.name?.[0] || "U"}
                  </span>
                )}
                <div className="min-w-0">
                  <Link href={`/brands/${encodeURIComponent(ad.advertiser.id || "unknown")}`} className="text-[15px] font-[600] text-ink transition-colors hover:text-brand">
                    {ad.advertiser.name || "Unknown"}
                  </Link>
                  <p className="mt-1 text-[12px] text-muted">Page ID {ad.advertiser.id}</p>
                </div>
              </div>
            </section>
          </aside>

        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------------
// Layout Primitives
// --------------------------------------------------------------------------------

function SectionHeader({ number, title }: { number: string; title: string }) { 
  return (
    <div className="flex items-baseline gap-[12px]">
      <span className="text-[11px] font-[700] tracking-[.08em] text-brand">{number}</span>
      <h2 className="text-[19px] font-[600] tracking-tight text-ink">{title}</h2>
    </div>
  ); 
}

function CopyMeta({ label, value, wide }: { label: string; value?: string | null; wide?: boolean }) { 
  return (
    <div className={cn("p-5", !wide && "flex items-start justify-between gap-6")}>
      <p className="text-[13px] font-[550] text-muted whitespace-nowrap">{label}</p>
      <div className={cn(wide ? "mt-[8px]" : "text-right max-w-[65%]")}>
        <p className="text-[14px] font-[400] text-ink leading-[1.6]">
          {value || <span className="text-muted italic">Not provided by source</span>}
        </p>
      </div>
    </div>
  ); 
}

function DeliveryMeta({ label, value, noBorder }: { label: string; value?: string | null; noBorder?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between gap-[16px] px-5 py-[14px]", !noBorder && "border-b border-[#E8EAE7]")}>
      <p className="text-[13px] font-[550] text-muted">{label}</p>
      <p className="text-[13px] font-[500] text-ink text-right max-w-[65%]">
        {value || <span className="text-muted">—</span>}
      </p>
    </div>
  );
}

function titleCase(value: string) { 
  return value.replaceAll("_", " ").replace(/\b\w/g, char => char.toUpperCase()); 
}

// --------------------------------------------------------------------------------
// Creative Viewer
// --------------------------------------------------------------------------------

function DetailCreativePreview({ ad, media }: { ad: NormalizedAd; media: string | null }) {
  const [ratio, setRatio] = useState<number | null>(null);
  const imageSource = media || safeExternalUrl(ad.creative.thumbnailUrl);
  const orientation = orientationFromRatio(ratio);
  
  const mediaClass = cn(
    "mt-[16px] overflow-hidden rounded-[16px] border border-[#E8EAE7] bg-[#F5F5F5]",
    ad.creative.type === "video" && orientation === "portrait" && "mx-auto max-w-[460px] aspect-[9/16]",
    ad.creative.type === "video" && orientation === "landscape" && "aspect-video",
    ad.creative.type === "video" && orientation === "square" && "mx-auto max-w-[620px] aspect-square",
    ad.creative.type === "carousel" && "aspect-[4/5] max-h-[760px]",
    ad.creative.type !== "video" && ad.creative.type !== "carousel" && "max-h-[760px]"
  );

  if (ad.creative.type === "video" && media) {
    return (
      <div className={mediaClass} style={ratio ? { aspectRatio: `${ratio}` } : undefined}>
        <VideoPreview
          src={media}
          poster={ad.creative.thumbnailUrl}
          controls
          objectFit="contain"
          className="h-full w-full bg-black"
          onMetadata={({ width, height }) => setRatio(width / height)}
        />
      </div>
    );
  }

  if (ad.creative.type === "carousel" && ad.creative.carouselItems?.length) {
    const assets = ad.creative.carouselItems.map(item => item.imageUrl || item.videoUrl).filter(Boolean) as string[];
    return (
      <div className={mediaClass}>
        <CarouselPreview assets={assets} alt={`Creative from ${ad.advertiser?.name}`} className="h-full w-full" />
      </div>
    );
  }

  if (imageSource) {
    return (
      <div className={cn(mediaClass, "flex items-center justify-center")} style={{ aspectRatio: ratio ? `${ratio}` : "4 / 5" }}>
        <img
          src={imageSource}
          alt={`Creative from ${ad.advertiser?.name}`}
          className="h-full w-full object-contain"
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

  return <div className="mt-[16px] grid aspect-[4/5] place-items-center rounded-[16px] border border-[#E8EAE7] bg-[#F5F5F5] text-muted"><ImageIcon size={32} /></div>;
}

function orientationFromRatio(ratio: number | null) {
  if (!ratio) return "portrait";
  if (ratio > 1.15) return "landscape";
  if (ratio < 0.9) return "portrait";
  return "square";
}

// --------------------------------------------------------------------------------
// Intelligence Panels
// --------------------------------------------------------------------------------

function AdsHuntingSignalsPanel({
  ad,
  intelligence,
}: {
  ad: NormalizedAd;
  intelligence: ReturnType<typeof computeAdIntelligence>;
}) {
  const winner = intelligence.adjustedWinnerScore;

  return (
    <div className="rounded-[18px] border border-[#E8EAE7] bg-white p-[24px] shadow-[0_1px_2px_rgba(0,0,0,0.03),0_8px_24px_rgba(0,0,0,0.035)]">
      
      {/* Header */}
      <div className="flex items-start justify-between gap-[16px]">
        <div className="flex-1">
          <div className="flex items-center gap-[12px]">
            <p className="text-[11px] font-[650] uppercase tracking-[.08em] text-ink">ADSHUNTING SIGNALS</p>
            <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-[650] uppercase tracking-wide text-brand border border-brand/20">
              Estimated
            </span>
          </div>
          <p className="mt-[6px] text-[13px] text-muted">
            Observable creative and delivery intelligence
          </p>
        </div>
        <span
          className="shrink-0 text-muted transition-colors hover:text-ink cursor-help"
          title={`${BRAND.name} evaluates observable creative longevity, repetition, variants, recency, brand commitment, and creative quality. This is not private ad-account performance data.`}
          aria-label={`${BRAND.name} Winner Score explanation`}
        >
          <Info size={18} />
        </span>
      </div>

      {/* Winner Score Hero */}
      <div className="mt-[32px]">
        <div className="flex items-baseline gap-[4px]">
          <span className="text-[48px] font-[650] leading-none text-ink tracking-tight">{winner}</span>
          <span className="text-[16px] font-[500] text-muted">/ 100</span>
        </div>
        <div className="mt-[6px]">
          <p className="text-[15px] font-[600] text-ink">AdsHunting Winner Score</p>
          <p className="text-[13px] text-muted mt-[2px]">{scoreSignalLabel(winner)}</p>
        </div>
        <div className="mt-[16px] h-[7px] w-full overflow-hidden rounded-[999px] bg-[#EEF1EC]">
          <div className="h-full rounded-[999px] bg-brand transition-all duration-500 ease-out" style={{ width: `${Math.min(100, Math.max(0, winner))}%` }} />
        </div>
      </div>

      <div className="mt-[32px] h-px w-full bg-[#E8EAE7]" />

      {/* Primary Signal Rows */}
      <div className="mt-[24px] flex flex-col gap-[12px]">
        <SignalRow
          icon={<MousePointerClick size={20} />}
          label="Hook Score"
          value={`${intelligence.clickPropensityScore} / 100`}
          score={intelligence.clickPropensityScore}
          title={`${BRAND.name} estimate based on observable creative signals. This is not the advertisement's actual click-through data.`}
        />
        <SignalRow
          icon={<Target size={20} />}
          label="Conversion Potential"
          value={`${intelligence.conversionPotentialScore} / 100`}
          score={intelligence.conversionPotentialScore}
          title="Modeled from observable creative and delivery signals. Not actual account conversion or sales performance."
        />
        <SignalRow
          icon={<BarChart3 size={20} />}
          label="Confidence"
          value={`${intelligence.confidenceScore}%`}
          score={intelligence.confidenceScore}
          title="Confidence reflects completeness of public metadata such as dates, status, last seen, media, landing page, and related creative signals."
        />
      </div>

      <div className="mt-[32px] h-px w-full bg-[#E8EAE7]" />

      {/* Secondary Metrics Group */}
      <div className="mt-[24px] grid grid-cols-1 sm:grid-cols-3 gap-[12px]">
        <Fact label="Longevity" value={longevityDisplay(ad.delivery.daysRunning ?? null)} score={`${intelligence.longevityScore} / 100`} />
        <Fact label="Creative Repetition" value={repetitionDisplay(ad.creativeRepetition ?? 0)} score={`${intelligence.repetitionScore} / 100`} />
        <Fact label="Brand Commitment" value={scoreSignalLabel(intelligence.brandCommitmentScore)} score={`${intelligence.brandCommitmentScore} / 100`} />
      </div>

    </div>
  );
}

function SignalRow({ icon, label, value, score, title }: { icon: React.ReactNode; label: string; value: string; score: number; title: string }) {
  return (
    <div 
      className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-x-[16px] gap-y-[6px] rounded-[14px] border border-[#E8EAE7] bg-white p-[16px] transition-colors hover:bg-zinc-50/50" 
      title={title}
    >
      {/* Icon Column (Fixed width) */}
      <div className="flex h-full w-[28px] items-start justify-center pt-0.5 text-brand">
        {icon}
      </div>
      
      {/* Content Column (Flexible width) */}
      <div className="min-w-0">
        <p className="truncate text-[14px] font-[600] text-ink">{label}</p>
        <div className="mt-[8px] h-[6px] w-full overflow-hidden rounded-[999px] bg-[#EEF1EC]">
          <div className="h-full rounded-[999px] bg-brand" style={{ width: `${Math.min(100, Math.max(0, score))}%` }} />
        </div>
      </div>
      
      {/* Score Column (Fixed width) */}
      <div className="text-right pt-[2px]">
        <span className="text-[13px] font-[600] text-ink whitespace-nowrap">{value}</span>
      </div>
    </div>
  );
}

function Fact({ label, value, score }: { label: string; value: string; score: string }) {
  return (
    <div className="rounded-[14px] border border-[#E8EAE7] bg-white p-[16px] flex flex-col justify-between h-full min-h-[96px]">
      <p className="text-[13px] font-[550] text-muted">{label}</p>
      <div className="mt-auto pt-[8px]">
        <p className="text-[14px] font-[600] text-ink leading-tight">{value}</p>
        <p className="mt-[4px] text-[12px] text-muted leading-none">{score}</p>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------------
// Demographics
// --------------------------------------------------------------------------------

function DemographicsPanel({ demographics }: { demographics: Record<string, Record<string, number>> | null }) {
  const groups = Object.entries(demographics ?? {}).flatMap(([category, values]) => {
    if (!values || !Object.keys(values).length) return [];
    return [{ category, values }];
  });

  if (!groups.length) {
    return (
      <div className="mt-4 rounded-[16px] border border-[#E8EAE7] bg-white p-5">
        <div className="flex items-start gap-[16px]">
          <span className="grid size-[40px] shrink-0 place-items-center rounded-[12px] bg-zinc-50 text-muted">
            <Users size={20} />
          </span>
          <div>
            <p className="text-[14px] font-[600] text-ink">Demographics unavailable</p>
            <p className="mt-[4px] text-[13px] leading-[1.6] text-muted">Meta does not expose audience demographic breakdown for this ad through the available public source.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 grid gap-[16px]">
      {groups.map(({ category, values }) => {
        const entries = Object.entries(values)
          .flatMap(([label, amount]) => Number.isFinite(Number(amount)) ? [[label, Number(amount)] as const] : [])
          .sort(([, a], [, b]) => b - a);
        const max = Math.max(...entries.map(([, amount]) => amount), 0);
        return (
          <div key={category} className="rounded-[16px] border border-[#E8EAE7] bg-white p-[20px]">
            <p className="text-[11px] font-[700] uppercase tracking-[.1em] text-muted">{demographicTitle(category)}</p>
            <div className="mt-[16px] space-y-[12px]">
              {entries.map(([label, amount]) => (
                <div key={label}>
                  <div className="flex items-center justify-between gap-[16px] text-[13px]">
                    <span className="min-w-0 truncate font-[500] text-ink">{titleCase(label)}</span>
                    <span className="shrink-0 font-[600] text-muted">{formatDemographicValue(amount)}</span>
                  </div>
                  {max > 0 && (
                    <div className="mt-[8px] h-[6px] overflow-hidden rounded-[999px] bg-[#EEF1EC]">
                      <div className="h-full rounded-[999px] bg-brand" style={{ width: `${Math.max(3, Math.min(100, (amount / max) * 100))}%` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function demographicTitle(value: string) {
  if (value === "age") return "Age Distribution";
  if (value === "gender") return "Gender";
  if (value === "regions") return "Top Regions";
  if (value === "reach") return "Reach Distribution";
  return titleCase(value);
}

function formatDemographicValue(value: number) {
  if (value > 0 && value <= 1) return `${Math.round(value * 100)}%`;
  return Number.isInteger(value) ? value.toLocaleString() : value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

// --------------------------------------------------------------------------------
// Label Helpers
// --------------------------------------------------------------------------------

function scoreSignalLabel(score: number) {
  if (score >= 90) return "Exceptional Signal";
  if (score >= 80) return "Strong Signal";
  if (score >= 70) return "Promising";
  if (score >= 55) return "Moderate";
  return "Early / Weak Signal";
}

function longevityDisplay(days: number | null) {
  if (days == null) return "Unknown";
  if (days >= 90) return "Exceptional";
  if (days >= 60) return "Strong Longevity";
  if (days >= 30) return "Long Runner";
  if (days >= 14) return "Promising";
  if (days >= 7) return "Early Signal";
  return "New Test";
}

function repetitionDisplay(count: number) {
  if (count >= 8) return "High";
  if (count >= 4) return "Strong";
  if (count >= 2) return "Moderate";
  if (count >= 1) return "Observed";
  return "Not observed";
}

function displaySignalLabel(label: string, score: number) {
  if (label === "High-Confidence Winner") return "Exceptional";
  if (label === "Proven Long Runner") return "Long Runner";
  if (label === "Emerging Winner") return "Promising";
  if (label === "Standard") return score >= 70 ? "Strong Signal" : score >= 55 ? "Promising" : "Testing";
  return label;
}
