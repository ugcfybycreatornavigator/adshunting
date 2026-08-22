"use client";

import Link from "next/link";
import { FormEvent, useState, useEffect } from "react";
import { ChevronRight, Loader2, Plus, Search, Users, X, Check } from "lucide-react";
import { Button, EmptyState } from "@/components/ui";
import { CompetitorIntelligence } from "@/lib/brand-data";
import { safeExternalUrl } from "@/lib/utils";
import type { NormalizedAd } from "@/lib/types";

export function CompetitorDashboard({ initialBrands }: { initialBrands: CompetitorIntelligence[] }) {
  const [adding, setAdding] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-ink">Your Competitors</h2>
          <p className="text-sm font-medium text-muted mt-1">{initialBrands.length} tracked</p>
        </div>
        <Button variant="primary" className="bg-brand hover:bg-brand-hover text-white flex-shrink-0" onClick={() => setAdding(true)}>
          <Plus size={16} /> Add Competitor
        </Button>
      </div>

      {initialBrands.length ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
          {initialBrands.map((brand) => (
            <CompetitorCard key={brand.advertiserId} brand={brand} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Users />}
          title="No competitors tracked yet"
          body="Track brands to monitor their newest ads, creative launches and long-running winners."
          action={
            <Button variant="primary" className="bg-brand hover:bg-brand-hover text-white" onClick={() => setAdding(true)}>
              <Plus size={16} /> Add Competitor
            </Button>
          }
        />
      )}

      {adding && (
        <AddCompetitorModal
          onClose={() => setAdding(false)}
          onAdded={() => {
            setAdding(false);
            window.location.reload(); // Quick refresh to update SSR initialBrands
          }}
        />
      )}
    </>
  );
}

function CompetitorCard({ brand }: { brand: CompetitorIntelligence }) {
  const initial = brand.brandName?.slice(0, 1).toUpperCase() || "B";
  const avatar = safeExternalUrl(brand.logoUrl);

  const timeAgo = brand.lastActivityAt 
    ? new Date(brand.lastActivityAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : "Recently";

  return (
    <article className="group flex flex-col w-full overflow-hidden rounded-[16px] border border-line bg-white transition-all duration-200 hover:border-brand-border hover:shadow-sm">
      <div className="flex flex-col p-5 flex-1">
        {/* Header */}
        <div className="flex items-center gap-3">
          {avatar ? (
            <img
              src={avatar}
              alt={brand.brandName}
              className="size-11 shrink-0 rounded-full border border-line object-cover bg-zinc-50"
              loading="lazy"
            />
          ) : (
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-zinc-800 text-sm font-bold text-white">
              {initial}
            </span>
          )}
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate text-[16px] font-semibold text-ink">{brand.brandName}</h3>
              <div className="text-muted opacity-50 flex-shrink-0 leading-none tracking-widest text-[10px]">•••</div>
            </div>
            <p className="truncate text-[13px] text-muted">{brand.category || "Advertiser"}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="flex size-1.5 rounded-full bg-brand"></span>
              <p className="truncate text-[11px] font-bold text-brand uppercase tracking-wider">Tracking</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-6 mb-6">
          <div className="flex flex-col">
            <span className="text-[20px] font-semibold text-ink">{brand.activeAds}</span>
            <span className="text-xs text-muted font-medium mt-0.5">Active Ads</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[20px] font-semibold text-ink">{brand.uniqueAds}</span>
            <span className="text-xs text-muted font-medium mt-0.5">Unique Ads</span>
          </div>
          <div className="flex flex-col">
            <span className={`text-[20px] font-semibold ${brand.newAdsThisWeek > 0 ? "text-brand" : "text-ink"}`}>
              {brand.newAdsThisWeek > 0 ? `+${brand.newAdsThisWeek}` : brand.newAdsThisWeek}
            </span>
            <span className="text-xs text-muted font-medium mt-0.5">This Week</span>
          </div>
        </div>

        {/* Creatives Preview */}
        <p className="text-[13px] font-semibold text-ink mb-3">Latest Creatives</p>
        {brand.latestCreatives && brand.latestCreatives.length > 0 ? (
          <div className="flex gap-2 mb-5">
            {brand.latestCreatives.map((preview, i) => (
              <div
                key={preview.id || i}
                className="flex-1 relative aspect-square bg-zinc-100 rounded-lg overflow-hidden border border-line/50 group-hover:border-line transition"
              >
                <img src={preview.url} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-1 items-start justify-center p-4 bg-zinc-50 rounded-lg border border-line/50 mb-5">
            <span className="text-sm font-medium text-ink">No creatives discovered yet.</span>
            <span className="text-xs text-muted">We&apos;ll show new ads here once detected.</span>
          </div>
        )}

        {/* Action */}
        <div className="flex items-center justify-between text-[13px] mt-auto pt-4 border-t border-line/50">
          <span className="text-muted font-medium">{brand.activeAds > 0 ? `Last activity ${timeAgo}` : 'No active ads detected'}</span>
          <Link
            href={`/competitors/${encodeURIComponent(brand.advertiserId)}`}
            className="flex items-center gap-1 font-semibold text-ink transition hover:text-brand"
          >
            View Intelligence <ChevronRight size={14} className="opacity-70" />
          </Link>
        </div>
      </div>
    </article>
  );
}

type Candidate = { id: string; name: string; avatar: string | null; activeAds: number };

function AddCompetitorModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Candidate[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [trackedIds, setTrackedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/competitors")
      .then((res) => res.json())
      .then((data) => {
        if (data.competitors) {
          setTrackedIds(new Set(data.competitors.map((c: { advertiser_id: string }) => c.advertiser_id)));
        }
      });
  }, []);

  async function search(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    setBusy(true);
    setError("");

    const response = await fetch("/api/ads/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, status: "all" }),
    });

    const data = await response.json();
    setBusy(false);
    if (!response.ok) return setError(data.message || data.error);

    const map = new Map<string, Candidate>();
    (data.ads as NormalizedAd[]).forEach((ad) => {
      const current = map.get(ad.advertiserId);
      map.set(ad.advertiserId, {
        id: ad.advertiserId,
        name: ad.advertiserName,
        avatar: ad.advertiserAvatarUrl,
        activeAds: (current?.activeAds || 0) + (ad.status === "active" ? 1 : 0),
      });
    });

    setResults([...map.values()].slice(0, 5));
  }

  async function track(candidate: Candidate) {
    if (trackedIds.has(candidate.id)) return;
    setBusy(true);
    const response = await fetch("/api/competitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        advertiserId: candidate.id,
        advertiserName: candidate.name,
        advertiserAvatarUrl: candidate.avatar,
      }),
    });

    const data = await response.json();
    setBusy(false);
    if (!response.ok) return setError(data.error);
    onAdded();
  }

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-end bg-black/25 sm:place-items-center sm:p-4 backdrop-blur-sm transition-opacity"
      onMouseDown={onClose}
    >
      <div
        className="w-full rounded-t-2xl bg-white p-5 sm:max-w-lg sm:rounded-2xl shadow-xl border border-line"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink">Add competitor</h2>
            <p className="mt-1 text-xs font-medium text-muted">Search a brand to start tracking.</p>
          </div>
          <button onClick={onClose} className="grid size-10 place-items-center text-muted hover:text-ink transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={search} className="mt-5 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={15} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search brands..."
              className="h-11 w-full rounded-lg border border-line pl-9 pr-3 text-sm outline-none focus:border-brand shadow-sm transition"
            />
          </div>
          <Button type="submit" disabled={busy || !query.trim()} variant="primary" className="bg-brand hover:bg-brand-hover text-white flex-shrink-0 h-11">
            {busy ? <Loader2 className="animate-spin" size={15} /> : "Search"}
          </Button>
        </form>

        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-600 font-medium">{error}</p>}

        <div className="mt-6 max-h-[60vh] space-y-2 overflow-y-auto">
          {results.map((candidate) => {
            const isTracked = trackedIds.has(candidate.id);
            return (
              <div
                key={candidate.id}
                className="flex w-full items-center gap-3 rounded-xl border border-line p-3 hover:border-brand/30 hover:bg-brand-soft transition"
              >
                {candidate.avatar ? (
                  <img src={candidate.avatar} alt="" className="size-10 rounded-full border border-line/50 object-cover" />
                ) : (
                  <span className="grid size-10 place-items-center rounded-full bg-zinc-800 text-xs font-bold text-white">
                    {candidate.name[0]?.toUpperCase() || "B"}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold text-ink">{candidate.name}</span>
                  <span className="text-[12px] text-muted font-medium mt-0.5">{candidate.activeAds} active ads</span>
                </div>
                <button
                  onClick={() => track(candidate)}
                  disabled={isTracked || busy}
                  className={`flex h-[34px] flex-shrink-0 items-center justify-center gap-1.5 rounded-md px-3.5 text-[13px] font-bold transition ${
                    isTracked
                      ? "bg-brand text-white cursor-default"
                      : "bg-white border border-line text-ink hover:border-brand hover:text-brand"
                  }`}
                >
                  {isTracked ? (
                    <>
                      <Check size={14} /> Tracking
                    </>
                  ) : (
                    "Track"
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
