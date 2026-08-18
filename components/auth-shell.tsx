"use client";

import type { ReactNode } from "react";
import { BrandMark } from "@/components/brand-mark";
import { BRAND } from "@/lib/brand";

export function AuthShell({ children, mode }: { children: ReactNode; mode: "sign-in" | "sign-up" }) {
  const title = mode === "sign-in" ? "Welcome back" : "Create your Bucket account";
  const body =
    mode === "sign-in"
      ? `Sign in to continue to ${BRAND.name}.`
      : "Start building your creative intelligence library.";

  return (
    <main className="min-h-screen bg-white text-ink lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(420px,2fr)]">
      {/* 60% Visual Side (Desktop/Tablet) */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-[#090B10] px-12 pb-12 pt-14 lg:flex border-r border-line">
        <div className="relative z-10">
          <BrandMark inverted compact href="/" />
        </div>
        
        {/* Animated Visual Asset */}
        <div className="absolute inset-0 flex items-center justify-center p-12 overflow-hidden pointer-events-none">
          <img 
            src="/brand/bucket-auth-visual.svg" 
            alt="Bucket Creative Intelligence" 
            className="w-full h-full object-cover object-center mix-blend-lighten motion-safe:animate-[auth-float_12s_ease-in-out_infinite]"
          />
        </div>

        <div className="relative z-10 max-w-xl">
          <h1 className="text-3xl font-semibold leading-snug tracking-tight text-white mb-4">
            Find the creative patterns<br />worth saving.
          </h1>
          <p className="text-[15px] leading-relaxed text-[#A1A1AA] max-w-md">
            Discover competitor ads, understand observable signals, and organize winning creative research.
          </p>
          <div className="mt-8 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[.15em] text-[#6F7380]">
            <span>Discover</span>
            <span className="text-[#FF3347] opacity-60">→</span>
            <span>Analyze</span>
            <span className="text-[#FF3347] opacity-60">→</span>
            <span>Save</span>
            <span className="text-[#FF3347] opacity-60">→</span>
            <span>Organize</span>
          </div>
        </div>
        
        {/* Subtle noise/gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090B10] via-transparent to-transparent opacity-80 pointer-events-none" />
      </section>

      {/* 40% Form Side */}
      <section className="flex min-h-screen flex-col items-center justify-center px-6 py-8 lg:px-10">
        <div className="w-full max-w-[420px]">
          {/* Mobile Logo */}
          <div className="mb-10 flex lg:hidden">
            <BrandMark compact href="/" />
          </div>

          <div className="mb-8">
            <h2 className="text-[32px] font-bold tracking-tight text-[#111217]">{title}</h2>
            <p className="mt-2 text-[15px] text-[#6F7380]">{body}</p>
          </div>

          {/* Clerk Form Injection */}
          <div className="w-full">{children}</div>
        </div>
      </section>
    </main>
  );
}
