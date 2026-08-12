import type { ReactNode } from "react";
import { BarChart3, Bookmark, Search, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

const signals = [
  ["Live Ad Discovery", "Search active competitor creatives by brand, market, format, and duration.", Search],
  ["Observable Scoring", "Rank ads with longevity, repetition, variants, recency, and confidence.", BarChart3],
  ["Swipe Files", "Save high-signal creative patterns into organized collections.", Bookmark],
] as const;

export function AuthShell({ children, mode }: { children: ReactNode; mode: "sign-in" | "sign-up" }) {
  const title = mode === "sign-in" ? "Sign in to Runlytics" : "Create your Runlytics workspace";
  const body =
    mode === "sign-in"
      ? "Get back to competitor discovery, creative signals, and saved swipe files."
      : "Start tracking observable ad signals without pretending public ads reveal private performance data.";

  return (
    <main className="min-h-screen bg-white text-ink">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(430px,520px)]">
        <section className="hidden border-r border-line bg-zinc-50 px-10 py-8 lg:flex lg:flex-col">
          <BrandMark href="/sign-in" />
          <div className="flex flex-1 flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-signal">Performance marketers</p>
            <h1 className="mt-4 max-w-xl text-5xl font-semibold leading-[1.02] tracking-[-.045em] text-ink">
              Competitor ads, ranked by evidence.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted">
              Runlytics turns public ad-library observations into useful creative intelligence while keeping private CTR, ROAS, CPC, and revenue clearly private.
            </p>
            <div className="mt-10 grid max-w-xl gap-3">
              {signals.map(([label, copy, Icon]) => (
                <div key={label} className="flex items-start gap-3 rounded-xl border border-line bg-white p-4 shadow-card">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-red-50 text-signal">
                    <Icon size={18} />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-ink">{label}</h2>
                    <p className="mt-1 text-xs leading-5 text-muted">{copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 border-t border-line pt-5 text-xs font-medium text-muted">
            <ShieldCheck size={15} className="text-signal" />
            No fabricated competitor CTR, ROAS, CPC, sales, or revenue.
          </div>
        </section>

        <section className="flex min-h-screen flex-col px-4 py-5 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between lg:hidden">
            <BrandMark href="/sign-in" compact />
            <span className="rounded-full border border-line bg-zinc-50 px-3 py-1.5 text-[11px] font-semibold text-muted">
              Ads Intelligence
            </span>
          </div>
          <div className="flex flex-1 items-center justify-center py-8 sm:py-10">
            <div className="w-full max-w-[440px]">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[.18em] text-signal">Runlytics</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-[-.035em] text-ink">{title}</h1>
                <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
              </div>
              <div className="rounded-xl border border-line bg-white p-4 shadow-auth sm:p-6">
                {children}
              </div>
              <p className="mt-4 text-center text-xs font-medium text-muted">
                Secure authentication powered by Clerk
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
