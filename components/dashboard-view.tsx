"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, Compass, Bookmark, Link2, Users, Settings, Store, ImageIcon, PlayCircle, Images } from "lucide-react";
import type { DashboardData } from "@/lib/dashboard";
import type { NormalizedAd } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function DashboardView({ data }: { data: DashboardData }) {
  const { user, actions } = data;

  const currentHour = new Date().getHours();
  let greeting = "Good Evening";
  if (currentHour < 12) greeting = "Good Morning";
  else if (currentHour < 18) greeting = "Good Afternoon";

  const actionCards = [
    { title: "Brands", count: actions.brands, description: "Explore brand intelligence", href: "/brands", icon: Store },
    { title: "Saved Ads", count: actions.savedAds, description: "Review your saved creatives", href: actions.savedAdsHref, icon: Bookmark },
    { title: "Shared Ads", count: actions.sharedAds, description: "Manage creatives you've shared", href: "/shared-ads", icon: Link2 },
    { title: "Competitors", count: actions.competitors, description: "Monitor brands and creative activity", href: "/competitors", icon: Users },
  ];

  const learnCards = [
    { step: "01", title: "Discover winning ads", description: "Search brands, creatives and markets", href: "/discover" },
    { step: "02", title: "Build your Swipe Files", description: "Save and organize creative research", href: "/swipe-files" },
    { step: "03", title: "Track competitors", description: "Monitor brands and creative patterns", href: "/competitors" },
  ];

  // Continue research items (take most recent from recent ads or most saved)
  const continueResearchItems = [...data.mostSaved, ...data.recent].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto pb-24">
      {/* Header */}
      <header className="mb-8 flex items-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-xl bg-black text-white shadow-sm">
          <Compass size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Home</h1>
          <p className="text-sm text-muted">Your Creative Intelligence Hub</p>
        </div>
      </header>

      {/* Welcome Card */}
      <section className="mb-8 overflow-hidden rounded-[20px] border border-line bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)] sm:mb-10">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-center gap-5">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="Avatar" className="size-16 rounded-full object-cover shadow-sm ring-1 ring-black/5 sm:size-20" />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-full bg-surface text-xl font-bold text-muted ring-1 ring-black/5 sm:size-20">
                {user?.firstName?.[0] || "?"}
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-ink sm:text-2xl">
                {greeting}, {user?.firstName || "Welcome"}
              </h2>
              <p className="mt-1 text-sm text-muted">{user?.email || "Signed in"}</p>
            </div>
          </div>
          <Link href="/settings" className="inline-flex h-10 w-fit items-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-semibold text-ink shadow-sm transition hover:bg-zinc-50">
            <Settings size={16} className="text-muted" />
            Account Settings
          </Link>
        </div>
      </section>

      {/* 4 Primary Actions */}
      <section className="mb-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {actionCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group flex flex-col justify-between rounded-[20px] border border-line bg-white p-4 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-150 hover:-translate-y-[1px] hover:border-zinc-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2"
          >
            <div className="flex items-start justify-between">
              <span className="flex size-10 items-center justify-center rounded-xl bg-surface text-ink transition-colors group-hover:bg-zinc-100">
                <card.icon size={20} />
              </span>
              <ArrowUpRight size={18} className="text-zinc-400 transition-all duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-signal" />
            </div>
            <div className="mt-6 sm:mt-8">
              <p className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
                {card.count == null ? "—" : card.count.toLocaleString()}
              </p>
              <h3 className="mt-1 sm:mt-2 text-sm sm:text-base font-semibold text-ink">{card.title}</h3>
              <p className="mt-1 text-[11px] sm:text-[13px] leading-relaxed text-muted line-clamp-2 sm:line-clamp-none">
                {card.description}
              </p>
            </div>
          </Link>
        ))}
      </section>

            {/* Continue Research */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold text-ink">Continue Research</h2>
        <p className="mb-6 mt-1 text-sm text-muted">Pick up where you left off</p>
        
        {continueResearchItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {continueResearchItems.map((ad) => (
              <ResearchCard key={ad.id} ad={ad} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-zinc-300 bg-surface/50 py-12 text-center">
            <Compass className="mb-4 text-zinc-400" size={32} />
            <h3 className="text-sm font-semibold text-ink">Start exploring winning creatives</h3>
            <p className="mt-1 text-xs text-muted max-w-sm">Discover top performing ads and save them to build your research library.</p>
            <Link href="/discover" className="mt-6 inline-flex h-9 items-center justify-center rounded-lg bg-signal px-5 text-sm font-medium text-white shadow-sm hover:bg-signal/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2">
              Discover Ads
            </Link>
          </div>
        )}
      </section>

      {/* Learn AdsHunting */}
      <section>
        <h2 className="text-lg font-semibold text-ink">Learn AdsHunting</h2>
        <p className="mb-6 mt-1 text-sm text-muted">Get more from your creative intelligence workflow</p>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {learnCards.map((card) => (
            <Link key={card.step} href={card.href} className="group flex items-start gap-4 rounded-[16px] border border-line bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md">
              <span className="text-xs font-bold text-zinc-300 tracking-wider pt-0.5">{card.step}</span>
              <div>
                <h3 className="text-sm font-semibold text-ink flex items-center gap-1.5 transition-colors group-hover:text-signal">
                  {card.title}
                  <ArrowRight size={14} className="opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
                </h3>
                <p className="mt-1.5 text-xs text-muted leading-relaxed">{card.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}


function ResearchCard({ ad }: { ad: NormalizedAd }) {
  const [failed, setFailed] = useState(false);
  
  let mediaUrl = ad.creative?.thumbnailUrl || ad.creative?.videoUrl || ad.creative?.imageUrl;
  const isVideo = ad.creative?.type === "video";
  const isCarousel = ad.creative?.type === "carousel";
  
  if (isCarousel && ad.creative?.carouselItems && ad.creative.carouselItems.length > 0) {
    mediaUrl = ad.creative.carouselItems[0].imageUrl || ad.creative.carouselItems[0].videoUrl || null;
  }

  // If the primary media is a video file but we have no thumbnail, we can't reliably show an image.
  if (isVideo && mediaUrl?.includes(".mp4")) {
    mediaUrl = null; // force fallback if there's no actual thumbnail image
  }

  return (
    <Link href={`/discover?ad=${ad.externalId || ad.id}`} className="group flex flex-col overflow-hidden rounded-[16px] border border-line bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-150 hover:-translate-y-[1px] hover:border-zinc-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2">
      <div className="aspect-[4/5] w-full bg-neutral-100 relative overflow-hidden flex items-center justify-center">
        {!mediaUrl || failed ? (
          <div className="flex flex-col items-center justify-center gap-2 text-zinc-400 p-4 text-center">
            <ImageIcon size={24} />
            <span className="text-[11px] font-medium uppercase tracking-wider">Preview unavailable</span>
          </div>
        ) : (
          <img 
            src={mediaUrl} 
            alt={ad.advertiser?.name || "Advertiser"} 
            onError={() => setFailed(true)}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" 
            loading="lazy" 
          />
        )}
        
        {isVideo && !failed && mediaUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
            <PlayCircle size={40} className="text-white drop-shadow-md" strokeWidth={1.5} />
          </div>
        )}

        {isCarousel && ad.creative?.carouselItems && ad.creative.carouselItems.length > 0 && !failed && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            <Images size={10} />
            Carousel · {ad.creative.carouselItems.length}
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 transition duration-150 group-hover:bg-black/5" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="truncate text-sm font-semibold text-ink">{ad.advertiser?.name}</p>
        <p className="mt-1 line-clamp-1 text-xs text-muted">{ad.copy?.headline || ad.copy?.primaryText || "View creative details"}</p>
        <div className="mt-auto pt-3">
          <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
            {ad.provider?.fetchedAt ? formatDate(ad.provider.fetchedAt) : ad.delivery?.startedAt ? formatDate(ad.delivery.startedAt) : "Recently active"}
          </p>
        </div>
      </div>
    </Link>
  );
}
