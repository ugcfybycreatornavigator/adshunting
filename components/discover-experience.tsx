"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Filter, History, Loader2, Plus, RefreshCw, Search, X } from "lucide-react";
import { AdCard } from "@/components/ad-card";
import { AdDetailDrawer } from "@/components/ad-detail";
import { SwipeFilePicker, type SwipeFileResult } from "@/components/swipe-file-picker";
import { Button, EmptyState, Skeleton } from "@/components/ui";
import type { AdSearchFilters, AdSearchResult, NormalizedAd } from "@/lib/types";
import { cn } from "@/lib/utils";

const countries = [["ALL","All countries"],["IN","India"],["US","United States"],["GB","United Kingdom"],["CA","Canada"],["AU","Australia"],["DE","Germany"],["FR","France"],["BR","Brazil"]];
const ctas = ["", "Shop Now", "Learn More", "Sign Up", "Download", "Get Offer", "Book Now", "Send Message"];
const defaults: AdSearchFilters = { query: "", status: "all", country: "ALL", platforms: [], mediaType: "all", cta: "", duration: "", startDate: "", endDate: "" };

export function DiscoverExperience({ brandId }: { brandId?: string }) {
  const [filters, setFilters] = useState<AdSearchFilters>({ ...defaults, brand: brandId });
  const [ads, setAds] = useState<NormalizedAd[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [details, setDetails] = useState<NormalizedAd | null>(null);
  const [swipeFileAd, setSwipeFileAd] = useState<NormalizedAd | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState("relevant");
  const [history, setHistory] = useState<string[]>([]);
  const [savedAdIds, setSavedAdIds] = useState<Set<string>>(new Set());
  const [adCollectionIds, setAdCollectionIds] = useState<Record<string, string[]>>({});
  const [toast, setToast] = useState<{ message: string; tone?: "success" | "error" } | null>(null);
  const [deepLinkedAdId, setDeepLinkedAdId] = useState<string | null>(null);
  const first = useRef(true);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const requestController = useRef<AbortController | null>(null);

  useEffect(() => {
    try { setHistory(JSON.parse(localStorage.getItem("signal-search-history") || "[]")); } catch {}
    if (typeof window !== "undefined") {
      setDeepLinkedAdId(new URLSearchParams(window.location.search).get("ad"));
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/saved-ads")
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((data) => {
        if (!active || !data?.savedAds) return;
        const ids = new Set<string>();
        const collectionMap: Record<string, string[]> = {};
        for (const item of data.savedAds as { ad: NormalizedAd; collectionIds?: string[] }[]) {
          ids.add(item.ad.externalAdId);
          collectionMap[item.ad.externalAdId] = item.collectionIds ?? [];
        }
        setSavedAdIds(ids);
        setAdCollectionIds(collectionMap);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const search = useCallback(async (nextFilters: AdSearchFilters, append = false) => {
    if (!append) requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ads/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextFilters),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok) {
        throw { message: data.message || data.error || "Search failed.", code: data.code };
      }
      const result = data as AdSearchResult;
      setAds(current => append ? [...current, ...result.ads.filter(ad => !current.some(existing => existing.externalAdId === ad.externalAdId))] : result.ads);
      setCursor(result.nextCursor);
      setTotal(result.total);

      if (nextFilters.query?.trim()) {
        setHistory(current => {
          const updated = [nextFilters.query!.trim(), ...current.filter(item => item.toLowerCase() !== nextFilters.query!.trim().toLowerCase())].slice(0, 6);
          localStorage.setItem("signal-search-history", JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      const errorObj = typeof err === "object" && err !== null && "message" in err ? (err as { message: string; code?: string }) : { message: "Search is temporarily unavailable." };
      setError(errorObj);
      if (!append) setAds([]);
    } finally {
      if (requestController.current === controller) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      search({ ...filters, cursor: undefined });
    }, first.current ? 0 : 400);
    first.current = false;
    return () => clearTimeout(timer);
  }, [filters, search]);

  const displayedAds = useMemo(() => sortAds(ads, sort), [ads, sort]);

  useEffect(() => {
    if (!deepLinkedAdId || details) return;
    const local = ads.find((ad) => ad.externalAdId === deepLinkedAdId || ad.id === deepLinkedAdId);
    if (local) {
      setDetails(local);
      return;
    }
    let active = true;
    fetch(`/api/ads/${encodeURIComponent(deepLinkedAdId)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || data.error);
        if (active && data.ad) setDetails(data.ad);
      })
      .catch(() => setToast({ message: "Couldn't open that shared ad.", tone: "error" }));
    return () => {
      active = false;
    };
  }, [ads, deepLinkedAdId, details]);

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; value: string }[] = [];
    if (filters.status && filters.status !== "all") {
      chips.push({ key: "status", label: `Status: ${title(filters.status)}`, value: filters.status });
    }
    if (filters.country && filters.country !== "ALL") {
      const countryName = countries.find(([code]) => code === filters.country)?.[1] || filters.country;
      chips.push({ key: "country", label: `Country: ${countryName}`, value: filters.country });
    }
    if (filters.mediaType && filters.mediaType !== "all") {
      chips.push({ key: "mediaType", label: `Media: ${title(filters.mediaType)}`, value: filters.mediaType });
    }
    if (filters.duration) {
      chips.push({ key: "duration", label: `Duration: ${filters.duration}`, value: filters.duration });
    }
    if (filters.cta) {
      chips.push({ key: "cta", label: `CTA: ${filters.cta}`, value: filters.cta });
    }
    if (filters.language) {
      chips.push({ key: "language", label: `Language: ${filters.language.toUpperCase()}`, value: filters.language });
    }
    if (filters.startDate) {
      chips.push({ key: "startDate", label: `From: ${filters.startDate}`, value: filters.startDate });
    }
    if (filters.endDate) {
      chips.push({ key: "endDate", label: `To: ${filters.endDate}`, value: filters.endDate });
    }
    if (filters.platforms && filters.platforms.length > 0) {
      filters.platforms.forEach(p => {
        chips.push({ key: "platforms", label: title(p), value: p });
      });
    }
    return chips;
  }, [filters]);

  function removeChip(key: string, value: string) {
    setFilters(current => {
      if (key === "platforms") {
        return { ...current, platforms: (current.platforms || []).filter(item => item !== value) };
      }
      return { ...current, [key]: defaults[key as keyof AdSearchFilters] };
    });
  }

  function clearAllFilters() {
    setFilters({
      ...defaults,
      query: filters.query,
      brand: brandId,
    });
  }

  function update<K extends keyof AdSearchFilters>(key: K, value: AdSearchFilters[K]) {
    setFilters(current => ({ ...current, [key]: value }));
  }

  async function saveAd(ad: NormalizedAd) {
    try {
      const response = await fetch("/api/saved-ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ad, collectionIds: [] }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSavedAdIds((current) => new Set([...current, ad.externalAdId]));
      setToast({ message: "Ad saved" });
    } catch {
      setToast({ message: "Couldn't save this ad. Try again.", tone: "error" });
    }
  }

  async function shareAd(ad: NormalizedAd) {
    const shareUrl = `${window.location.origin}/discover?ad=${encodeURIComponent(ad.externalAdId)}`;
    try {
      await copyText(shareUrl);
      setToast({ message: "Link copied" });
    } catch {
      setToast({ message: "Couldn't copy link. Try again.", tone: "error" });
    }
  }

  function handleSwipeFileAdded(ad: NormalizedAd, result: SwipeFileResult) {
    setSavedAdIds((current) => new Set([...current, ad.externalAdId]));
    setAdCollectionIds((current) => ({
      ...current,
      [ad.externalAdId]: [...new Set([...(current[ad.externalAdId] ?? []), ...result.collectionIds])],
    }));
    setToast({ message: result.collectionNames.length > 1 ? `Added to ${result.collectionNames.length} Swipe Files` : `Added to ${result.collectionNames[0] || "Swipe File"}` });
  }

  return (
    <>
      <div className="sticky top-16 z-20 -mx-4 mt-0 border-y border-line bg-white/95 px-3 py-3 backdrop-blur sm:mx-0 sm:rounded-[10px] sm:border lg:top-0">
        <div className="grid gap-3 xl:grid-cols-[minmax(180px,240px)_minmax(320px,1fr)_auto] xl:items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-[-.025em] text-ink">Discover Ads</h1>
            <span className="rounded-full border border-line bg-zinc-50 px-2 py-1 text-[11px] font-semibold text-muted">
              {loading ? "Searching" : total != null ? total.toLocaleString() : ads.length.toLocaleString()}
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              ref={searchInputRef}
              value={filters.query || ""}
              onChange={event => update("query", event.target.value)}
              className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-9 text-sm outline-none placeholder:text-zinc-400 focus:border-signal"
              placeholder="Search keywords, brands, categories..."
              aria-label="Search ads"
            />
            {filters.query && (
              <button onClick={() => update("query", "")} className="absolute right-1.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md hover:bg-zinc-50" aria-label="Clear search">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => update("mediaType", "all")} className={quickFilterClass((filters.mediaType || "all") === "all")}>All Ads</button>
            <button type="button" onClick={() => searchInputRef.current?.focus()} className="min-h-9 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-muted transition hover:bg-zinc-50 hover:text-ink">Brands</button>
            <button type="button" onClick={() => update("mediaType", "video")} className={quickFilterClass(filters.mediaType === "video")}>Video</button>
            <button type="button" onClick={() => update("mediaType", "image")} className={quickFilterClass(filters.mediaType === "image")}>Image</button>
            <button type="button" onClick={() => update("mediaType", "carousel")} className={quickFilterClass(filters.mediaType === "carousel")}>Carousel</button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button variant="secondary" className="h-9 min-h-9 px-3 text-xs" onClick={() => setShowFilters(current => !current)}>
            <Plus size={14} />
            <span>Add Filter</span>
            {activeChips.length > 0 && (
              <span className="grid size-4 place-items-center rounded-full bg-signal text-[9px] font-bold text-white">
                {activeChips.length}
              </span>
            )}
          </Button>
          <CompactSelect ariaLabel="Country" value={filters.country || "ALL"} onChange={value => update("country", value)} options={countries} />
          <CompactSelect ariaLabel="Status" value={filters.status || "all"} onChange={value => update("status", value as AdSearchFilters["status"])} options={[["all","Status: All"],["active","Active"],["inactive","Inactive"]]} />
          <button type="button" onClick={() => setShowFilters(true)} className="min-h-9 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-muted transition hover:bg-zinc-50 hover:text-ink">Date</button>
          <CompactSelect ariaLabel="Sort" value={sort} onChange={setSort} options={[["relevant","Sort: Relevant"],["newest","Sort: Newest"],["oldest","Sort: Oldest"],["longest","Sort: Longest"],["variations","Sort: Variations"]]} />
          {loading && <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-muted"><Loader2 size={13} className="animate-spin text-signal" />Searching live ads...</span>}
        </div>

        {!filters.query && history.length > 0 && (
          <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            <History size={13} className="shrink-0 text-zinc-400" />
            {history.map(item => (
              <button key={item} onClick={() => update("query", item)} className="shrink-0 rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-muted hover:text-ink">
                {item}
              </button>
            ))}
            <button onClick={() => { localStorage.removeItem("signal-search-history"); setHistory([]); }} className="shrink-0 px-2 text-[11px] text-zinc-400 hover:text-signal">
              Clear
            </button>
          </div>
        )}

        {showFilters && (
          <FilterPanel filters={filters} update={update} onClear={clearAllFilters} />
        )}

        {activeChips.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Active</span>
            {activeChips.map(chip => (
              <button key={`${chip.key}-${chip.value}`} onClick={() => removeChip(chip.key, chip.value)} className="flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1.5 text-xs font-medium text-signal hover:bg-red-100 transition">
                {chip.label}
                <X size={12} />
              </button>
            ))}
            <button onClick={clearAllFilters} className="text-xs font-semibold text-muted hover:text-signal ml-1">
              Clear all
            </button>
          </div>
        )}
      </div>

      <div className="mt-3">
        {loading && ads.length === 0 ? (
          <AdGridSkeleton mediaType={filters.mediaType || "all"} />
        ) : error ? (
          <EmptyState
            icon={<Filter className="text-signal" />}
            title={error.code === "NOT_CONFIGURED" ? "No Ads Provider Configured" : "Search Temporarily Unavailable"}
            body={error.message}
            action={
              <Button variant="secondary" onClick={() => search(filters)}>
                <RefreshCw size={15} /> Retry search
              </Button>
            }
          />
        ) : ads.length === 0 ? (
          <EmptyState
            icon={<Search />}
            title="No ads found"
            body={filters.query?.trim() ? `No ads found for "${filters.query.trim()}". Try another keyword or remove active filters.` : "Type a keyword above (e.g. Nike, skincare, layerstory) to search live ads."}
            action={activeChips.length > 0 ? (
              <Button variant="secondary" onClick={clearAllFilters}>Clear filters</Button>
            ) : undefined}
          />
        ) : (
          <div className={gridClass(filters.mediaType || "all")}>
            {displayedAds.map(ad => (
              <AdCard
                key={`${ad.externalAdId}-${ad.id}`}
                ad={ad}
                saved={savedAdIds.has(ad.externalAdId)}
                variant="masonry"
                swipeFileCount={adCollectionIds[ad.externalAdId]?.length ?? 0}
                onOpen={() => setDetails(ad)}
                onSave={() => saveAd(ad)}
                onSwipeFile={() => setSwipeFileAd(ad)}
                onShare={() => shareAd(ad)}
              />
            ))}
          </div>
        )}
      </div>

      {cursor && !loading && (
        <div className="mt-7 flex justify-center">
          <Button variant="secondary" disabled={loadingMore} onClick={() => search({ ...filters, cursor }, true)}>
            {loadingMore && <Loader2 className="animate-spin" size={16} />}
            Load more ads
          </Button>
        </div>
      )}

      {details && <AdDetailDrawer ad={details} onClose={() => setDetails(null)} onSave={() => setSwipeFileAd(details)} />}
      {swipeFileAd && (
        <SwipeFilePicker
          ad={swipeFileAd}
          initialCollectionIds={adCollectionIds[swipeFileAd.externalAdId] ?? []}
          onClose={() => setSwipeFileAd(null)}
          onAdded={(result) => handleSwipeFileAdded(swipeFileAd, result)}
        />
      )}
      {toast && <Toast message={toast.message} tone={toast.tone} />}
    </>
  );
}

function FilterPanel({ filters, update, onClear }: { filters: AdSearchFilters; update: <K extends keyof AdSearchFilters>(key: K, value: AdSearchFilters[K]) => void; onClear: () => void }) {
  const platforms = ["facebook","instagram","messenger","audience_network"];
  return (
    <div className="mt-3 border-t border-line pt-4 animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Select label="Status" value={filters.status || "all"} onChange={value => update("status", value as AdSearchFilters["status"])} options={[["all","All status"],["active","Active"],["inactive","Inactive"]]} />
        <Select label="Country" value={filters.country || "ALL"} onChange={value => update("country", value)} options={countries} />
        <Select label="Media" value={filters.mediaType || "all"} onChange={value => update("mediaType", value as AdSearchFilters["mediaType"])} options={[["all","All media"],["video","Video"],["image","Image"],["carousel","Carousel"]]} />
        <Select label="Running duration" value={filters.duration || ""} onChange={value => update("duration", value)} options={[["","Any duration"],["today","Today"],["1-7","1–7 days"],["7-30","7–30 days"],["30-60","30–60 days"],["60-90","60–90 days"],["90+","90+ days"]]} />
        <Select label="CTA" value={filters.cta || ""} onChange={value => update("cta", value)} options={ctas.map(item => [item, item || "Any CTA"])} />
        <Select label="Language" value={filters.language || ""} onChange={value => update("language", value)} options={[["","Any language"],["en","English"],["hi","Hindi"],["es","Spanish"],["fr","French"],["de","German"]]} />
        <DateInput label="Start date" value={filters.startDate || ""} onChange={value => update("startDate", value)} />
        <DateInput label="End date" value={filters.endDate || ""} onChange={value => update("endDate", value)} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-semibold text-muted">Platforms</span>
        {platforms.map(platform => {
          const selected = filters.platforms?.includes(platform);
          return (
            <button
              key={platform}
              type="button"
              onClick={() => update("platforms", selected ? filters.platforms?.filter(item => item !== platform) : [...(filters.platforms || []), platform])}
              className={`min-h-9 rounded-lg border px-3 text-xs font-semibold transition ${selected ? "border-signal bg-red-50 text-signal" : "border-line bg-white text-muted hover:text-ink"}`}
            >
              {title(platform)}
            </button>
          );
        })}
        <button type="button" onClick={onClear} className="ml-auto min-h-9 px-2 text-xs font-semibold text-muted hover:text-signal">
          Reset panel
        </button>
      </div>
    </div>
  );
}

function Select({ label, value, options, onChange }: { label: string; value?: string; options: string[][]; onChange: (value: string) => void }) {
  return (
    <label className="text-[11px] font-semibold text-muted">
      <span className="mb-1.5 block">{label}</span>
      <span className="relative block">
        <select value={value || ""} onChange={event => onChange(event.target.value)} className="h-10 w-full appearance-none rounded-lg border border-line bg-white px-3 pr-8 text-sm font-medium text-ink outline-none focus:border-signal">
          {options.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
      </span>
    </label>
  );
}

function CompactSelect({ ariaLabel, value, options, onChange }: { ariaLabel: string; value?: string; options: string[][]; onChange: (value: string) => void }) {
  return (
    <span className="relative inline-block">
      <select
        aria-label={ariaLabel}
        value={value || ""}
        onChange={event => onChange(event.target.value)}
        className="h-9 appearance-none rounded-lg border border-line bg-white px-3 pr-8 text-xs font-semibold text-muted outline-none transition hover:bg-zinc-50 hover:text-ink focus:border-signal"
      >
        {options.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400" size={13} />
    </span>
  );
}

function DateInput({ label, value, onChange }: { label: string; value?: string; onChange: (value: string) => void }) {
  return (
    <label className="text-[11px] font-semibold text-muted">
      <span className="mb-1.5 block">{label}</span>
      <input type="date" value={value || ""} max={new Date().toISOString().slice(0,10)} onChange={event => onChange(event.target.value)} className="h-10 w-full rounded-lg border border-line bg-white px-3 text-sm font-medium outline-none focus:border-signal" />
    </label>
  );
}

function AdGridSkeleton({ mediaType }: { mediaType: AdSearchFilters["mediaType"] }) {
  return (
    <div className={gridClass(mediaType || "all")}>
      {Array.from({ length: 18 }).map((_, index) => (
        <div key={index} className="mb-3 inline-block w-full break-inside-avoid overflow-hidden rounded-[10px] border border-line">
          <div className="flex min-h-12 items-center gap-2.5 px-2.5 py-2">
            <Skeleton className="size-7 rounded-full" />
            <Skeleton className="h-3 flex-1" />
            <Skeleton className="size-7 rounded-md" />
          </div>
          <Skeleton className={skeletonMediaClass(mediaType || "all", index)} />
          <div className="p-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="mt-2 h-3 w-full" />
              </div>
            </div>
            <Skeleton className="mt-3 h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function gridClass(mediaType: AdSearchFilters["mediaType"]) {
  if (mediaType === "video") return "columns-1 min-[520px]:columns-2 md:columns-3 xl:columns-4 2xl:columns-5 [column-gap:12px]";
  return "columns-1 min-[520px]:columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 [column-gap:12px]";
}

function skeletonMediaClass(mediaType: AdSearchFilters["mediaType"], index = 0) {
  if (mediaType === "video") return "aspect-[9/16] rounded-none";
  if (mediaType === "carousel") return "aspect-[4/5] rounded-none";
  if (mediaType === "image") return index % 4 === 0 ? "aspect-square rounded-none" : index % 5 === 0 ? "aspect-video rounded-none" : "aspect-[4/5] rounded-none";
  return index % 6 === 0 ? "aspect-video rounded-none" : index % 4 === 0 ? "aspect-square rounded-none" : "aspect-[4/5] rounded-none";
}

function quickFilterClass(active: boolean) {
  return cn(
    "min-h-9 rounded-lg border px-3 text-xs font-semibold transition",
    active ? "border-red-100 bg-red-50 text-signal" : "border-line bg-white text-muted hover:bg-zinc-50 hover:text-ink"
  );
}

function title(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, char => char.toUpperCase());
}

function sortAds(ads: NormalizedAd[], sort?: string) {
  if (sort === "newest") return [...ads].sort((a, b) => new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime());
  if (sort === "oldest") return [...ads].sort((a, b) => new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime());
  if (sort === "longest") return [...ads].sort((a, b) => (b.runningDays || 0) - (a.runningDays || 0));
  if (sort === "variations") return [...ads].sort((a, b) => b.variants - a.variants);
  return ads;
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const field = document.createElement("textarea");
  field.value = value;
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.appendChild(field);
  field.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(field);
  if (!copied) throw new Error("Copy failed");
}

function Toast({ message, tone = "success" }: { message: string; tone?: "success" | "error" }) {
  return (
    <div className="fixed bottom-4 left-1/2 z-[90] -translate-x-1/2 px-4 sm:left-auto sm:right-5 sm:translate-x-0 sm:px-0" role="status" aria-live="polite">
      <div className={`rounded-lg border px-4 py-3 text-sm font-semibold shadow-card ${tone === "error" ? "border-red-100 bg-red-50 text-signal" : "border-line bg-white text-ink"}`}>
        {message}
      </div>
    </div>
  );
}
