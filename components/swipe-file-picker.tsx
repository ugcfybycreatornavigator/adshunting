"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, FolderPlus, Loader2, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui";
import type { Collection, NormalizedAd } from "@/lib/types";

export type SwipeFileResult = {
  savedAdId: string;
  collectionIds: string[];
  collectionNames: string[];
};

export function SwipeFilePicker({
  ad,
  initialCollectionIds = [],
  onClose,
  onAdded,
}: {
  ad: NormalizedAd;
  initialCollectionIds?: string[];
  onClose: () => void;
  onAdded?: (result: SwipeFileResult) => void;
}) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selected, setSelected] = useState<string[]>(initialCollectionIds);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch("/api/collections")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load Swipe Files.");
        if (active) setCollections(data.collections);
      })
      .catch(() => active && setError("Couldn't load your Swipe Files. Try again."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return collections;
    return collections.filter((collection) => collection.name.toLowerCase().includes(term));
  }, [collections, query]);

  async function createAndAdd() {
    if (!name.trim()) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      const collection: Collection = {
        id: data.collection.id,
        name: data.collection.name,
        description: data.collection.description,
        createdAt: data.collection.created_at,
        updatedAt: data.collection.updated_at,
        adCount: data.collection.adCount ?? 0,
      };
      setCollections((current) => [collection, ...current]);
      setSelected((current) => [...new Set([...current, collection.id])]);
      setName("");
      setCreating(false);
      await addToSwipeFiles([collection.id], [collection.name]);
    } catch {
      setError("Couldn't create that Swipe File. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function addToSwipeFiles(ids = selected, names?: string[]) {
    if (!ids.length) {
      setError("Choose at least one Swipe File.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/saved-ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ad, collectionIds: ids }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      const collectionNames = names ?? collections.filter((collection) => ids.includes(collection.id)).map((collection) => collection.name);
      const firstName = collectionNames[0] || "Swipe File";
      setDone(collectionNames.length > 1 ? `Added to ${collectionNames.length} Swipe Files` : `Added to ${firstName}`);
      onAdded?.({ savedAdId: data.savedAdId, collectionIds: ids, collectionNames });
      window.setTimeout(onClose, 900);
    } catch {
      setError("Couldn't add this ad to a Swipe File. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-end bg-black/25 p-0 sm:place-items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Add to Swipe File" onMouseDown={onClose}>
      <div className="w-full rounded-t-2xl bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Add to Swipe File</h2>
            <p className="mt-1 text-xs text-muted">Choose a folder or create one for this creative.</p>
          </div>
          <button type="button" onClick={onClose} className="grid size-10 shrink-0 place-items-center rounded-lg hover:bg-zinc-50" aria-label="Close Swipe File picker">
            <X size={18} />
          </button>
        </div>

        {done ? (
          <div className="my-10 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-red-50 text-signal"><Check /></span>
            <p className="mt-3 font-semibold">{done}</p>
          </div>
        ) : (
          <>
            <label className="relative mt-5 block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search Swipe Files..."
                className="h-11 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-sm outline-none focus:border-signal"
              />
            </label>

            <div className="mt-3 max-h-60 space-y-2 overflow-auto pr-1">
              {loading ? (
                <div className="rounded-lg border border-line p-4 text-sm text-muted">Loading Swipe Files...</div>
              ) : filtered.length ? (
                filtered.map((collection) => {
                  const checked = selected.includes(collection.id);
                  return (
                    <label key={collection.id} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-line px-3 transition hover:bg-zinc-50">
                      <input
                        type="checkbox"
                        className="size-4 accent-signal"
                        checked={checked}
                        onChange={() => setSelected((current) => checked ? current.filter((id) => id !== collection.id) : [...current, collection.id])}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{collection.name}</span>
                        <span className="text-[11px] text-muted">{collection.adCount ?? 0} saved ads</span>
                      </span>
                    </label>
                  );
                })
              ) : (
                <div className="rounded-lg border border-dashed border-line p-4 text-sm text-muted">No matching Swipe Files.</div>
              )}
            </div>

            {creating ? (
              <div className="mt-3 rounded-lg border border-line p-3">
                <label className="block text-xs font-semibold text-muted">
                  Name
                  <input
                    autoFocus
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && createAndAdd()}
                    placeholder="High-Converting Hooks"
                    className="mt-2 h-11 w-full rounded-lg border border-line px-3 text-sm outline-none focus:border-signal"
                  />
                </label>
                <Button variant="signal" className="mt-3 w-full" onClick={createAndAdd} disabled={busy || !name.trim()}>
                  {busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Create & Add
                </Button>
              </div>
            ) : (
              <button type="button" onClick={() => setCreating(true)} className="mt-3 flex min-h-11 w-full items-center gap-2 rounded-lg px-2 text-sm font-semibold text-signal hover:bg-red-50">
                <FolderPlus size={17} />
                Create new Swipe File
              </button>
            )}

            {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs leading-5 text-signal">{error}</p>}
            <div className="mt-5 flex justify-end gap-2 border-t border-line pt-4">
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button variant="signal" onClick={() => addToSwipeFiles()} disabled={busy || loading || selected.length === 0}>
                {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {busy ? "Adding..." : "Add to Swipe File"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
