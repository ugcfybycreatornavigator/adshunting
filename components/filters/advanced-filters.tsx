"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AdSearchFilters } from "@/lib/types";
import { NICHES, LANGUAGES, MARKETS, CONTENT_STYLES } from "@/lib/taxonomy";
import { Popover, Sheet, CheckboxItem, CollapsibleSection, SelectButtonGroup, SearchInput } from "./ui-primitives";
import { getActiveFilterCount } from "@/lib/filter-utils";
import { SavedFilters } from "./saved-filters";
import { Button } from "@/components/ui";
import { Filter, ChevronDown, X, Loader2 } from "lucide-react";

export interface AdvancedFiltersProps {
  filters: AdSearchFilters;
  updateFilters: (updates: Partial<AdSearchFilters>) => void;
  clearFilters: () => void;
}

export function AdvancedFilters({ filters, updateFilters }: AdvancedFiltersProps) {
  const [open, setOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<AdSearchFilters>(filters);
  const [applying, setApplying] = useState(false);

  // Search states
  const [marketSearch, setMarketSearch] = useState("");
  const [langSearch, setLangSearch] = useState("");
  const [nicheSearch, setNicheSearch] = useState("");
  const [styleSearch, setStyleSearch] = useState("");

  // Sync draft when opened
  useEffect(() => {
    if (open) {
      setDraftFilters(filters);
      setMarketSearch("");
      setLangSearch("");
      setNicheSearch("");
      setStyleSearch("");
    }
  }, [open, filters]);

  const activeFilterCount = getActiveFilterCount(filters);
  const draftCount = getActiveFilterCount(draftFilters);

  const handleApply = () => {
    setApplying(true);
    // Mimic slight delay for network stability or directly apply
    updateFilters(draftFilters);
    setTimeout(() => {
      setApplying(false);
      setOpen(false);
    }, 150); // Give time for UI feedback
  };



  const handleArrayToggle = (key: keyof AdSearchFilters, value: string) => {
    const current = (draftFilters[key] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setDraftFilters({ ...draftFilters, [key]: updated });
  };

  const handleApplySaved = (saved: AdSearchFilters) => {
    setDraftFilters(saved);
  };

  // Filtered lists based on search
  const filteredMarkets = useMemo(() => {
    if (!marketSearch) return MARKETS;
    return MARKETS.filter(m => m.label.toLowerCase().includes(marketSearch.toLowerCase()));
  }, [marketSearch]);

  const filteredLangs = useMemo(() => {
    if (!langSearch) return LANGUAGES;
    return LANGUAGES.filter(l => l.label.toLowerCase().includes(langSearch.toLowerCase()) || l.code.toLowerCase().includes(langSearch.toLowerCase()));
  }, [langSearch]);

  const filteredNiches = useMemo(() => {
    if (!nicheSearch) return NICHES;
    return NICHES.filter(n => n.label.toLowerCase().includes(nicheSearch.toLowerCase()));
  }, [nicheSearch]);

  const filteredStyles = useMemo(() => {
    if (!styleSearch) return CONTENT_STYLES;
    return CONTENT_STYLES.filter(s => s.label.toLowerCase().includes(styleSearch.toLowerCase()));
  }, [styleSearch]);

  const Header = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold tracking-tight text-ink">Filters</h2>
        {draftCount > 0 && (
          <span className="grid min-w-[20px] place-items-center rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-signal">
            {draftCount}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        {draftCount > 0 && (
          <Button variant="ghost" className="h-8 text-xs hover:text-signal" onClick={() => setDraftFilters({})}>
            Clear all
          </Button>
        )}
        <button onClick={() => setOpen(false)} className="rounded-full p-1.5 text-muted hover:bg-surface hover:text-ink">
          <X size={20} />
        </button>
      </div>
    </div>
  );

  const Footer = (
    <div className="flex items-center justify-end gap-3">
      <Button variant="secondary" className="flex-1 sm:flex-none" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      <Button variant="signal" className="flex-1 sm:flex-none" onClick={handleApply} disabled={applying}>
        {applying && <Loader2 size={16} className="mr-2 animate-spin" />}
        Apply filters
      </Button>
    </div>
  );

  const filterContent = (
    <div className="flex flex-col gap-0 pb-4">
      
      <CollapsibleSection title="Saved Filters" defaultExpanded={true}>
        <SavedFilters currentFilters={draftFilters} onApply={handleApplySaved} />
      </CollapsibleSection>

      <CollapsibleSection 
        title="Runtime" 
        selectedCount={draftFilters.runtime ? 1 : 0}
        summary={draftFilters.runtime ? `${draftFilters.runtime.minDays || 0} - ${draftFilters.runtime.maxDays || '+'} days` : "Any runtime"}
      >
        <div className="flex flex-col gap-3 pt-1">
          <SelectButtonGroup
            options={[
              { id: "today", label: "Started today" },
              { id: "1-3", label: "1–3 days" },
              { id: "4-7", label: "4–7 days" },
              { id: "8-14", label: "8–14 days" },
              { id: "15-30", label: "15–30 days" },
              { id: "31-90", label: "31–90 days" },
              { id: "90+", label: "90+ days" },
            ]}
            value={
              draftFilters.runtime?.minDays === 0 && draftFilters.runtime?.maxDays === 0 ? "today" :
              draftFilters.runtime?.minDays === 1 && draftFilters.runtime?.maxDays === 3 ? "1-3" :
              draftFilters.runtime?.minDays === 4 && draftFilters.runtime?.maxDays === 7 ? "4-7" :
              draftFilters.runtime?.minDays === 8 && draftFilters.runtime?.maxDays === 14 ? "8-14" :
              draftFilters.runtime?.minDays === 15 && draftFilters.runtime?.maxDays === 30 ? "15-30" :
              draftFilters.runtime?.minDays === 31 && draftFilters.runtime?.maxDays === 90 ? "31-90" :
              draftFilters.runtime?.minDays === 91 ? "90+" : undefined
            }
            onChange={(val) => {
              if (val === "today") setDraftFilters({ ...draftFilters, runtime: { minDays: 0, maxDays: 0 } });
              else if (val === "1-3") setDraftFilters({ ...draftFilters, runtime: { minDays: 1, maxDays: 3 } });
              else if (val === "4-7") setDraftFilters({ ...draftFilters, runtime: { minDays: 4, maxDays: 7 } });
              else if (val === "8-14") setDraftFilters({ ...draftFilters, runtime: { minDays: 8, maxDays: 14 } });
              else if (val === "15-30") setDraftFilters({ ...draftFilters, runtime: { minDays: 15, maxDays: 30 } });
              else if (val === "31-90") setDraftFilters({ ...draftFilters, runtime: { minDays: 31, maxDays: 90 } });
              else if (val === "90+") setDraftFilters({ ...draftFilters, runtime: { minDays: 91 } });
            }}
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              placeholder="Min days"
              value={draftFilters.runtime?.minDays ?? ""}
              onChange={(e) => setDraftFilters({ ...draftFilters, runtime: { ...draftFilters.runtime, minDays: e.target.value ? Math.max(0, parseInt(e.target.value)) : undefined } })}
              className="h-9 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none transition focus:border-signal focus:ring-1 focus:ring-signal"
            />
            <span className="text-muted">to</span>
            <input
              type="number"
              min="0"
              placeholder="Max days"
              value={draftFilters.runtime?.maxDays ?? ""}
              onChange={(e) => setDraftFilters({ ...draftFilters, runtime: { ...draftFilters.runtime, maxDays: e.target.value ? Math.max(0, parseInt(e.target.value)) : undefined } })}
              className="h-9 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none transition focus:border-signal focus:ring-1 focus:ring-signal"
            />
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection 
        title="Format" 
        selectedCount={draftFilters.formats?.length || 0}
        summary={draftFilters.formats?.join(", ") || "Any format"}
      >
        <SelectButtonGroup
          options={[
            { id: "image", label: "Image" },
            { id: "video", label: "Video" },
            { id: "carousel", label: "Carousel" },
          ]}
          value={draftFilters.formats}
          onChange={(val) => handleArrayToggle("formats", val)}
        />
      </CollapsibleSection>

      <CollapsibleSection 
        title="Status"
        selectedCount={draftFilters.statuses?.length || 0}
        summary={draftFilters.statuses?.join(", ") || "Active & Inactive"}
      >
        <SelectButtonGroup
          options={[
            { id: "active", label: "Active" },
            { id: "inactive", label: "Inactive" },
          ]}
          value={draftFilters.statuses}
          onChange={(val) => handleArrayToggle("statuses", val)}
        />
      </CollapsibleSection>

      <CollapsibleSection 
        title="Niches" 
        selectedCount={draftFilters.niches?.length || 0}
      >
        <SearchInput value={nicheSearch} onChange={setNicheSearch} placeholder="Search niches..." />
        <div className="max-h-56 overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-300">
          {filteredNiches.map((n) => (
            <CheckboxItem
              key={n.id}
              label={n.label}
              checked={draftFilters.niches?.includes(n.id) || false}
              onChange={() => handleArrayToggle("niches", n.id)}
            />
          ))}
          {filteredNiches.length === 0 && (
            <p className="text-sm text-muted p-2">No niches found.</p>
          )}
        </div>
      </CollapsibleSection>

      <CollapsibleSection 
        title="Languages"
        selectedCount={draftFilters.languages?.length || 0}
      >
        <SearchInput value={langSearch} onChange={setLangSearch} placeholder="Search languages..." />
        <div className="max-h-56 overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-300">
          {filteredLangs.map((l) => (
            <CheckboxItem
              key={l.code}
              label={l.label}
              checked={draftFilters.languages?.includes(l.code) || false}
              onChange={() => handleArrayToggle("languages", l.code)}
            />
          ))}
          {filteredLangs.length === 0 && (
            <p className="text-sm text-muted p-2">No languages found.</p>
          )}
        </div>
      </CollapsibleSection>

      <CollapsibleSection 
        title="Content Style"
        selectedCount={draftFilters.contentStyles?.length || 0}
      >
        <SearchInput value={styleSearch} onChange={setStyleSearch} placeholder="Search styles..." />
        <div className="max-h-56 overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-300">
          {filteredStyles.map((cs) => (
            <CheckboxItem
              key={cs.id}
              label={cs.label}
              checked={draftFilters.contentStyles?.includes(cs.id) || false}
              onChange={() => handleArrayToggle("contentStyles", cs.id)}
            />
          ))}
          {filteredStyles.length === 0 && (
            <p className="text-sm text-muted p-2">No styles found.</p>
          )}
        </div>
      </CollapsibleSection>

      <CollapsibleSection 
        title="Observed Markets"
        selectedCount={draftFilters.markets?.length || 0}
      >
        <SearchInput value={marketSearch} onChange={setMarketSearch} placeholder="Search markets..." />
        <div className="max-h-56 overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-300">
          {filteredMarkets.map((m) => (
            <CheckboxItem
              key={m.code}
              label={m.label}
              checked={draftFilters.markets?.includes(m.code) || false}
              onChange={() => handleArrayToggle("markets", m.code)}
            />
          ))}
          {filteredMarkets.length === 0 && (
            <p className="text-sm text-muted p-2">No markets found.</p>
          )}
        </div>
      </CollapsibleSection>

      <CollapsibleSection 
        title="Video Length"
        selectedCount={draftFilters.videoLength ? 1 : 0}
        summary={draftFilters.videoLength ? `${draftFilters.videoLength.minSeconds || 0} - ${draftFilters.videoLength.maxSeconds || '+'}s` : "Any length"}
      >
        <div className="flex flex-col gap-3 pt-1">
          <SelectButtonGroup
            options={[
              { id: "0-6", label: "Under 6s" },
              { id: "6-15", label: "6–15s" },
              { id: "16-30", label: "16–30s" },
              { id: "31-60", label: "31–60s" },
              { id: "61-90", label: "61–90s" },
              { id: "91+", label: "Over 90s" },
            ]}
            value={
              draftFilters.videoLength?.minSeconds === 0 && draftFilters.videoLength?.maxSeconds === 6 ? "0-6" :
              draftFilters.videoLength?.minSeconds === 6 && draftFilters.videoLength?.maxSeconds === 15 ? "6-15" :
              draftFilters.videoLength?.minSeconds === 16 && draftFilters.videoLength?.maxSeconds === 30 ? "16-30" :
              draftFilters.videoLength?.minSeconds === 31 && draftFilters.videoLength?.maxSeconds === 60 ? "31-60" :
              draftFilters.videoLength?.minSeconds === 61 && draftFilters.videoLength?.maxSeconds === 90 ? "61-90" :
              draftFilters.videoLength?.minSeconds === 91 ? "91+" : undefined
            }
            onChange={(val) => {
              if (val === "0-6") setDraftFilters({ ...draftFilters, videoLength: { minSeconds: 0, maxSeconds: 6 } });
              else if (val === "6-15") setDraftFilters({ ...draftFilters, videoLength: { minSeconds: 6, maxSeconds: 15 } });
              else if (val === "16-30") setDraftFilters({ ...draftFilters, videoLength: { minSeconds: 16, maxSeconds: 30 } });
              else if (val === "31-60") setDraftFilters({ ...draftFilters, videoLength: { minSeconds: 31, maxSeconds: 60 } });
              else if (val === "61-90") setDraftFilters({ ...draftFilters, videoLength: { minSeconds: 61, maxSeconds: 90 } });
              else if (val === "91+") setDraftFilters({ ...draftFilters, videoLength: { minSeconds: 91 } });
            }}
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              placeholder="Min sec"
              value={draftFilters.videoLength?.minSeconds ?? ""}
              onChange={(e) => setDraftFilters({ ...draftFilters, videoLength: { ...draftFilters.videoLength, minSeconds: e.target.value ? Math.max(0, parseInt(e.target.value)) : undefined } })}
              className="h-9 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none transition focus:border-signal focus:ring-1 focus:ring-signal"
            />
            <span className="text-muted">to</span>
            <input
              type="number"
              min="0"
              placeholder="Max sec"
              value={draftFilters.videoLength?.maxSeconds ?? ""}
              onChange={(e) => setDraftFilters({ ...draftFilters, videoLength: { ...draftFilters.videoLength, maxSeconds: e.target.value ? Math.max(0, parseInt(e.target.value)) : undefined } })}
              className="h-9 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none transition focus:border-signal focus:ring-1 focus:ring-signal"
            />
          </div>
        </div>
      </CollapsibleSection>

    </div>
  );

  return (
    <>
      <div className="hidden sm:block">
        <Popover
          open={open}
          onOpenChange={setOpen}
          header={Header}
          footer={Footer}
          trigger={
            <Button variant={activeFilterCount > 0 ? "signal" : "secondary"}>
              <Filter size={16} />
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              <ChevronDown size={14} className="ml-1 opacity-50" />
            </Button>
          }
        >
          {filterContent}
        </Popover>
      </div>

      <div className="block sm:hidden">
        <Button variant={activeFilterCount > 0 ? "signal" : "secondary"} onClick={() => setOpen(true)}>
          <Filter size={16} />
          {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>
        <Sheet 
          open={open} 
          onClose={() => setOpen(false)}
          header={Header}
          footer={Footer}
        >
          {filterContent}
        </Sheet>
      </div>
    </>
  );
}
