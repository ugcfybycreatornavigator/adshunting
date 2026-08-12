"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, Bookmark, Compass, FolderHeart, Gauge, Menu, Settings, ShieldCheck, Store, Users, X } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/utils";

const nav = [
  ["Dashboard", "/dashboard", Gauge],
  ["Discover Ads", "/discover", Compass],
  ["Swipe Files", "/swipe-files", FolderHeart],
  ["Competitors", "/competitors", Users],
  ["Brands", "/brands", Store],
  ["Saved Ads", "/saved", Bookmark],
  ["Collections", "/collections", FolderHeart],
  ["Analytics", "/analytics", BarChart3],
  ["Settings", "/settings", Settings],
] as const;

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-white/95 px-4 backdrop-blur lg:hidden">
        <BrandMark compact />
        <button
          aria-label="Open navigation"
          className="flex size-11 items-center justify-center rounded-lg border border-line"
          onClick={() => setOpen(true)}
        >
          <Menu size={20} />
        </button>
      </header>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/25 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <div
            className="h-full w-[min(86vw,300px)] bg-white p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <BrandMark />
              <button
                aria-label="Close navigation"
                className="flex size-11 items-center justify-center"
                onClick={() => setOpen(false)}
              >
                <X />
              </button>
            </div>
            <Navigation onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-line bg-white p-4 lg:flex lg:flex-col">
      <div className="rounded-xl border border-line bg-zinc-50 px-3 py-3">
        <BrandMark />
      </div>
      <div className="mt-7 flex-1">
        <Navigation />
      </div>
      <div className="rounded-xl border border-line bg-zinc-50 p-3">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <ShieldCheck size={15} className="text-signal" /> Observable intelligence
        </div>
        <p className="mt-1.5 text-[11px] leading-4 text-muted">
          Scores estimate creative momentum—not revenue or ROAS.
        </p>
      </div>
    </aside>
  );
}

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary navigation">
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-zinc-400">
        Workspace
      </p>
      <ul className="space-y-1">
        {nav.map(([label, href, Icon]) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                onClick={onNavigate}
                href={href}
                className={cn(
                  "group flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition",
                  active
                    ? "border border-red-100 bg-red-50 text-signal font-semibold"
                    : "text-muted hover:bg-surface hover:text-ink"
                )}
              >
                <Icon size={17} strokeWidth={active ? 2.4 : 2} />
                <span className="flex-1">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
