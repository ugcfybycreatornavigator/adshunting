"use client";

import { useState } from "react";
import Link from "next/link";
import { BarChart3, Bookmark, Check, ExternalLink, ImageIcon, Info, Layers3, Loader2, MousePointerClick, Repeat2, Target, Timer, Users, X } from "lucide-react";
import { Badge, Button } from "@/components/ui";
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
  const media = safeExternalUrl(ad.sourceMediaUrl);
  const intelligence = computeAdIntelligence({ startDate: ad.startDate, stopDate: ad.stopDate, status: ad.status, lastSeenAt: ad.lastSeenAt, variants: ad.variants, creativeRepetition: ad.creativeRepetition, platforms: ad.platforms, mediaType: ad.mediaType, headline: ad.headline, body: ad.body, cta: ad.cta, landingPageUrl: ad.landingPageUrl, sourceMediaUrl: ad.sourceMediaUrl, advertiserId: ad.advertiserId });
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
    <div className="fixed inset-0 z-[60] bg-black/25" role="dialog" aria-modal="true" aria-label={`Ad details for ${ad.advertiserName}`} onMouseDown={onClose}>
      <div className="absolute inset-0 overflow-y-auto bg-white md:left-auto md:w-[min(92vw,920px)] md:border-l md:border-line md:shadow-2xl" onMouseDown={event => event.stopPropagation()}>
        <header className="sticky top-0 z-10 flex min-h-16 items-center justify-between border-b border-line bg-white/95 px-4 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button onClick={onClose} className="grid size-10 shrink-0 place-items-center rounded-lg border border-line" aria-label="Close details">
              <X size={18} />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{ad.advertiserName}</p>
              <p className="text-xs text-muted">Library ID {ad.externalAdId}</p>
            </div>
          </div>
          <Button variant="signal" onClick={handleSave} disabled={isSaved || saving} aria-label={isSaved ? "Saved" : "Save to Saved Ads"}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : isSaved ? <Check size={16} /> : <Bookmark size={16} />}
            {saving ? "Saving..." : isSaved ? "Saved" : "Save"}
          </Button>
        </header>

        <div className="grid gap-8 p-4 sm:p-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,.8fr)]">
          <div>
            <section>
              <SectionTitle number="01" title="Creative" />
              <DetailCreativePreview ad={ad} media={media} />
            </section>

            <section className="mt-8">
              <SectionTitle number="02" title="Copy" />
              <div className="mt-3 divide-y divide-line rounded-card border border-line">
                <Meta label="Body copy" value={ad.body} wide />
                <Meta label="Headline" value={ad.headline} />
                <Meta label="Description" value={ad.description} />
                <Meta label="Call to action" value={ad.cta} />
                <Meta label="Hashtags" value={ad.hashtags.length ? ad.hashtags.join(" ") : null} wide />
              </div>
            </section>

            <section className="mt-8">
              <SectionTitle number="03" title="Landing page" />
              <div className="mt-3 rounded-card border border-line p-4">
                {ad.landingPageUrl ? (
                  <a href={ad.landingPageUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-4 text-sm font-medium hover:text-signal">
                    <span className="truncate">{ad.landingPageUrl}</span>
                    <ExternalLink className="shrink-0" size={16} />
                  </a>
                ) : (
                  <p className="text-sm text-muted">Not available from data provider</p>
                )}
              </div>
            </section>
          </div>

          <aside>
            <section>
              <SectionTitle number="04" title={`${BRAND.name} Signals`} />
              <div className="mt-3">
                <AdsHuntingSignalsPanel ad={ad} intelligence={intelligence} />
              </div>

              {ad.intelligenceLabels.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {ad.intelligenceLabels.map(label => (
                    <Badge tone="red" key={label}>{displaySignalLabel(label, ad.winnerScore)}</Badge>
                  ))}
                </div>
              )}
            </section>

            <section className="mt-8">
              <SectionTitle number="05" title="Delivery" />
              <div className="mt-3 divide-y divide-line rounded-card border border-line">
                <Meta label="Status" value={ad.status.toUpperCase()} />
                <Meta label="Started running" value={ad.startDate ? formatDate(ad.startDate) : null} />
                <Meta label="Stopped running" value={ad.stopDate ? formatDate(ad.stopDate) : ad.status === "active" ? "Still active" : null} />
                <Meta label="First seen" value={formatDate(ad.firstSeenAt)} />
                <Meta label="Last checked" value={formatDate(ad.lastSeenAt)} />
                <Meta label="Country" value={ad.country} />
                <Meta label="Platforms" value={ad.platforms.length ? ad.platforms.map(titleCase).join(" · ") : null} />
              </div>
            </section>

            <section className="mt-8">
              <SectionTitle number="06" title="Audience / Demographics" />
              <DemographicsPanel demographics={ad.demographics} />
            </section>

            <section className="mt-8">
              <SectionTitle number="07" title="Advertiser" />
              <div className="mt-3 rounded-card border border-line p-4">
                <div className="flex items-center gap-3">
                  {ad.advertiserAvatarUrl ? (
                    <img src={ad.advertiserAvatarUrl} alt="" className="size-11 rounded-full border border-line" />
                  ) : (
                    <span className="grid size-11 place-items-center rounded-full bg-black font-semibold text-white">{ad.advertiserName[0]}</span>
                  )}
                  <div className="min-w-0">
                    <Link href={`/brands/${encodeURIComponent(ad.advertiserId)}`} className="font-semibold hover:text-signal">
                      {ad.advertiserName}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted">Page ID {ad.advertiserId}</p>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
function SectionTitle({ number, title }: { number: string; title: string }) { return <div className="flex items-center gap-3"><span className="text-[10px] font-bold tracking-wider text-signal">{number}</span><h2 className="text-lg font-semibold tracking-tight">{title}</h2></div>; }
function Meta({ label, value, wide }: { label: string; value?: string | null; wide?: boolean }) { return <div className={`p-4 ${wide ? "block" : "flex items-start justify-between gap-5"}`}><p className="text-xs font-medium text-muted">{label}</p><p className={`${wide ? "mt-2 max-w-prose leading-6" : "text-right"} text-sm font-medium`}>{value || "Not available from data provider"}</p></div>; }
function titleCase(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, char => char.toUpperCase()); }

function DemographicsPanel({ demographics }: { demographics: NormalizedAd["demographics"] }) {
  const groups = Object.entries(demographics ?? {}).flatMap(([category, values]) => {
    if (!values || !Object.keys(values).length) return [];
    return [{ category, values }];
  });

  if (!groups.length) {
    return (
      <div className="mt-3 rounded-card border border-line bg-white p-4">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-zinc-50 text-muted">
            <Users size={17} />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">Demographics not available for this advertisement.</p>
            <p className="mt-1 text-xs leading-5 text-muted">Audience breakdown was not provided by the source for this ad.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 grid gap-3">
      {groups.map(({ category, values }) => {
        const entries = Object.entries(values)
          .flatMap(([label, amount]) => Number.isFinite(Number(amount)) ? [[label, Number(amount)] as const] : [])
          .sort(([, a], [, b]) => b - a);
        const max = Math.max(...entries.map(([, amount]) => amount), 0);
        return (
          <div key={category} className="rounded-card border border-line bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-[.14em] text-muted">{demographicTitle(category)}</p>
            <div className="mt-3 space-y-2">
              {entries.map(([label, amount]) => (
                <div key={label}>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="min-w-0 truncate font-medium text-ink">{titleCase(label)}</span>
                    <span className="shrink-0 text-xs font-semibold text-muted">{formatDemographicValue(amount)}</span>
                  </div>
                  {max > 0 && (
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                      <div className="h-full rounded-full bg-signal" style={{ width: `${Math.max(3, Math.min(100, (amount / max) * 100))}%` }} />
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

function DetailCreativePreview({ ad, media }: { ad: NormalizedAd; media: string | null }) {
  const [ratio, setRatio] = useState<number | null>(null);
  const imageSource = media || safeExternalUrl(ad.thumbnailUrl);
  const orientation = orientationFromRatio(ratio);
  const mediaClass = cn(
    "mt-3 overflow-hidden rounded-card border border-line bg-zinc-50",
    ad.mediaType === "video" && orientation === "portrait" && "mx-auto max-w-[460px] aspect-[9/16]",
    ad.mediaType === "video" && orientation === "landscape" && "aspect-video",
    ad.mediaType === "video" && orientation === "square" && "mx-auto max-w-[620px] aspect-square",
    ad.mediaType === "carousel" && "aspect-[4/5] max-h-[760px]",
    ad.mediaType !== "video" && ad.mediaType !== "carousel" && "max-h-[760px]"
  );

  if (ad.mediaType === "video" && media) {
    return (
      <div className={mediaClass} style={ratio ? { aspectRatio: `${ratio}` } : undefined}>
        <VideoPreview
          src={media}
          poster={ad.thumbnailUrl}
          controls
          objectFit="contain"
          className="h-full w-full bg-black"
          onMetadata={({ width, height }) => setRatio(width / height)}
        />
      </div>
    );
  }

  if (ad.mediaType === "carousel" && ad.carouselAssets.length) {
    return (
      <div className={mediaClass}>
        <CarouselPreview assets={ad.carouselAssets} alt={`Creative from ${ad.advertiserName}`} className="h-full w-full" />
      </div>
    );
  }

  if (imageSource) {
    return (
      <div className={cn(mediaClass, "flex items-center justify-center")} style={{ aspectRatio: ratio ? `${ratio}` : "4 / 5" }}>
        <img
          src={imageSource}
          alt={`Creative from ${ad.advertiserName}`}
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

  return <div className="mt-3 grid aspect-[4/5] place-items-center rounded-card border border-line bg-zinc-50 text-muted"><ImageIcon /></div>;
}

function AdsHuntingSignalsPanel({
  ad,
  intelligence,
}: {
  ad: NormalizedAd;
  intelligence: ReturnType<typeof computeAdIntelligence>;
}) {
  const winner = intelligence.adjustedWinnerScore;

  return (
    <div className="rounded-card border border-line bg-white p-4 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-bold uppercase tracking-[.16em] text-ink">{BRAND.name} Signals</p>
            <span className="rounded bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase text-signal">Estimated</span>
          </div>
          <p className="mt-1 text-xs leading-5 text-muted">Observable creative and delivery intelligence estimated by {BRAND.name}, not official Meta performance data</p>
        </div>
        <span
          className="mt-0.5 shrink-0 text-muted"
          title={`${BRAND.name} evaluates observable creative longevity, repetition, variants, recency, brand commitment, and creative quality. This is not private ad-account performance data.`}
          aria-label={`${BRAND.name} Winner Score explanation`}
        >
          <Info size={16} />
        </span>
      </div>

      <div className="mt-5 flex items-end gap-4">
        <div className="shrink-0">
          <p className="text-5xl font-semibold tracking-[-.04em] text-ink">
            {winner}<span className="ml-1 text-base text-muted">/100</span>
          </p>
          <p className="mt-1 text-sm font-semibold text-ink">{BRAND.name} Winner Score</p>
          <p className="mt-0.5 text-xs text-muted">{scoreSignalLabel(winner)}</p>
        </div>
        <div className="min-w-0 flex-1 pb-3">
          <ScoreBar value={winner} />
        </div>
      </div>

      <div className="mt-4 space-y-2 border-t border-line pt-4">
        <SignalRow
          icon={<MousePointerClick />}
          label="Click Propensity"
          value={`${intelligence.clickPropensityScore} / 100`}
          score={intelligence.clickPropensityScore}
          title={`${BRAND.name} estimate based on observable creative signals. This is not the advertisement's actual click-through data.`}
        />
        <SignalRow
          icon={<Target />}
          label="Conversion Potential"
          value={`${intelligence.conversionPotentialScore} / 100`}
          score={intelligence.conversionPotentialScore}
          title="Modeled from observable creative and delivery signals. Not actual account conversion or sales performance."
        />
        <SignalRow
          icon={<BarChart3 />}
          label="Confidence"
          value={`${intelligence.confidenceScore}%`}
          score={intelligence.confidenceScore}
          title="Confidence reflects completeness of public metadata such as dates, status, last seen, media, landing page, and related creative signals."
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 border-t border-line pt-4 text-xs sm:grid-cols-3">
        <Fact icon={<Timer />} label="Longevity" value={longevityDisplay(ad.runningDays)} score={`${intelligence.longevityScore} / 100`} />
        <Fact icon={<Repeat2 />} label="Creative Repetition" value={repetitionDisplay(ad.creativeRepetition)} score={`${intelligence.repetitionScore} / 100`} />
        <Fact icon={<Layers3 />} label="Brand Commitment" value={scoreSignalLabel(intelligence.brandCommitmentScore)} score={`${intelligence.brandCommitmentScore} / 100`} />
      </div>

    </div>
  );
}

function SignalRow({ icon, label, value, score, title }: { icon: React.ReactNode; label: string; value: string; score: number; title: string }) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-line px-3 py-2.5" title={title}>
      <span className="grid size-8 place-items-center rounded-md bg-red-50 text-signal [&>svg]:size-4">{icon}</span>
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-1.5">
          <p className="truncate text-xs font-semibold text-ink">{label}</p>
          <Info size={12} className="shrink-0 text-zinc-400" aria-hidden />
        </div>
        <ScoreBar value={score} className="mt-1.5" />
      </div>
      <strong className="text-xs font-semibold text-ink">{value}</strong>
    </div>
  );
}

function Fact({ icon, label, value, score }: { icon: React.ReactNode; label: string; value: string; score: string }) {
  return (
    <div className="rounded-lg border border-line p-3">
      <div className="flex items-center gap-2 text-muted [&>svg]:size-3.5">{icon}<span>{label}</span></div>
      <p className="mt-2 font-semibold text-ink">{value}</p>
      <p className="mt-0.5 text-[11px] text-muted">{score}</p>
    </div>
  );
}

function ScoreBar({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={cn("h-1.5 overflow-hidden rounded-full bg-zinc-100", className)}>
      <div className="h-full rounded-full bg-signal" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

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

function orientationFromRatio(ratio: number | null) {
  if (!ratio) return "portrait";
  if (ratio > 1.15) return "landscape";
  if (ratio < 0.9) return "portrait";
  return "square";
}
