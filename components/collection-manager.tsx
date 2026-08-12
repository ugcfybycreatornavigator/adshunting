"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { ArrowRight, Folder, FolderPlus, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button, Card, EmptyState, Skeleton } from "@/components/ui";
import type { Collection } from "@/lib/types";

export function CollectionManager({ itemHrefBase = "/collections" }: { itemHrefBase?: "/collections" | "/swipe-files" }) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<Collection | "new" | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/collections");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setCollections(data.collections);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load folders.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function remove(collection: Collection) {
    if (!confirm(`Delete “${collection.name}”? Saved ads will remain in your main library.`)) return;
    const response = await fetch(`/api/collections?id=${collection.id}`, { method: "DELETE" });
    if (response.ok) setCollections((current) => current.filter((item) => item.id !== collection.id));
  }

  if (loading) return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-44" />)}</div>;
  return <>
    {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-signal">{error}</p>}
    {collections.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      <button onClick={() => setModal("new")} className="flex min-h-44 flex-col items-center justify-center rounded-card border border-dashed border-zinc-300 bg-surface/50 text-center transition hover:border-signal hover:bg-red-50">
        <span className="grid size-11 place-items-center rounded-full bg-white text-signal shadow-sm"><FolderPlus size={20} /></span>
        <span className="mt-3 text-sm font-semibold">Create new folder</span><span className="mt-1 text-xs text-muted">Organize your next creative angle</span>
      </button>
      {collections.map((collection) => <Card key={collection.id} className="group min-h-44 p-5 shadow-none">
        <div className="flex items-start justify-between"><span className="grid size-10 place-items-center rounded-lg bg-red-50 text-signal"><Folder size={18} fill="currentColor" /></span>
          <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"><button onClick={() => setModal(collection)} aria-label="Rename folder" className="grid size-9 place-items-center rounded-lg hover:bg-surface"><Pencil size={14} /></button><button onClick={() => remove(collection)} aria-label="Delete folder" className="grid size-9 place-items-center rounded-lg hover:bg-red-50 hover:text-signal"><Trash2 size={14} /></button></div>
        </div>
        <Link href={`${itemHrefBase}/${collection.id}`} className="mt-5 block"><p className="truncate text-base font-semibold">{collection.name}</p><p className="mt-1 line-clamp-1 text-xs text-muted">{collection.description || "Curated creative references"}</p><div className="mt-5 flex items-center justify-between text-xs"><span className="font-medium text-muted">{collection.adCount || 0} ads</span><span className="flex items-center gap-1 font-semibold">Open <ArrowRight size={13} /></span></div></Link>
      </Card>)}
    </div> : <EmptyState icon={<FolderPlus />} title="Build your first collection" body="Create focused folders for winning hooks, competitor research, UGC formats, offers, and campaign inspiration." action={<Button variant="signal" onClick={() => setModal("new")}><Plus size={16} />Create folder</Button>} />}
    {modal && <CollectionModal collection={modal === "new" ? null : modal} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} />}
  </>;
}

function CollectionModal({ collection, onClose, onSaved }: { collection: Collection | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(collection?.name || "");
  const [description, setDescription] = useState(collection?.description || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true);
    const response = await fetch("/api/collections", { method: collection ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: collection?.id, name, description }) });
    const data = await response.json(); setBusy(false);
    if (!response.ok) return setError(data.error);
    onSaved();
  }
  return <div className="fixed inset-0 z-[70] grid place-items-end bg-black/25 sm:place-items-center sm:p-4" onMouseDown={onClose}><form onSubmit={submit} className="w-full rounded-t-2xl bg-white p-5 sm:max-w-md sm:rounded-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">{collection ? "Edit folder" : "Create a collection"}</h2><button type="button" onClick={onClose} className="grid size-10 place-items-center"><X size={18} /></button></div><label className="mt-5 block text-xs font-semibold text-muted">Folder name<input autoFocus value={name} onChange={(event) => setName(event.target.value)} maxLength={80} className="mt-2 h-11 w-full rounded-lg border border-line px-3 text-sm outline-none focus:border-signal" placeholder="Winning Hooks" /></label><label className="mt-4 block text-xs font-semibold text-muted">Description <span className="font-normal">(optional)</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} rows={3} className="mt-2 w-full resize-none rounded-lg border border-line p-3 text-sm outline-none focus:border-signal" /></label>{error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-signal">{error}</p>}<div className="mt-5 flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" variant="signal" disabled={!name.trim() || busy}>{busy && <Loader2 size={15} className="animate-spin" />}{collection ? "Save changes" : "Create folder"}</Button></div></form></div>;
}
