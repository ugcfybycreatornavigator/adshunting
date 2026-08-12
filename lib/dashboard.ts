import { isSupabaseConfigured } from "@/lib/env";
import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseServerClient } from "@/lib/supabase/clerk-server";
import { dbAdToNormalized, type DatabaseAdRow } from "@/lib/catalog";
import type { NormalizedAd } from "@/lib/types";

export type DashboardData = {
  metrics: { totalAds: number; activeAds: number; newToday: number; savedAds: number; competitors: number; longestRunning: number; newThisWeek: number; winningAds: number };
  topRunning: NormalizedAd[]; trending: NormalizedAd[]; recent: NormalizedAd[]; mostSaved: NormalizedAd[];
  competitors: { name: string; advertiserId: string; activeAds: number; newThisWeek: number }[];
};

export async function getDashboardData(): Promise<DashboardData> {
  const empty: DashboardData = { metrics: { totalAds: 0, activeAds: 0, newToday: 0, savedAds: 0, competitors: 0, longestRunning: 0, newThisWeek: 0, winningAds: 0 }, topRunning: [], trending: [], recent: [], mostSaved: [], competitors: [] };
  if (!isSupabaseConfigured) return empty;
  
  const authObj = await auth();
  const userId = authObj.userId;
  const supabase = await createClerkSupabaseServerClient();
  
  const now = new Date(); const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString(); const week = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const [total, active, newToday, saved, competitors, newWeek, longest, top, recent, catalogue, savedRows, competitorRows] = await Promise.all([
    supabase.from("ads").select("*", { count: "exact", head: true }), supabase.from("ads").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("ads").select("*", { count: "exact", head: true }).gte("start_date", today), userId ? supabase.from("saved_ads").select("*", { count: "exact", head: true }).eq("user_id", userId) : Promise.resolve({ count: 0 }),
    userId ? supabase.from("competitors").select("*", { count: "exact", head: true }).eq("user_id", userId) : Promise.resolve({ count: 0 }), supabase.from("ads").select("*", { count: "exact", head: true }).gte("start_date", week),
    supabase.from("ads").select("running_days").eq("status", "active").order("running_days", { ascending: false }).limit(1).maybeSingle(), supabase.from("ads").select("*").eq("status", "active").order("running_days", { ascending: false }).limit(5),
    supabase.from("ads").select("*").order("start_date", { ascending: false }).limit(5),
    supabase.from("ads").select("*").eq("status", "active").order("last_seen_at", { ascending: false }).limit(120),
    userId ? supabase.from("saved_ads").select("ads(*)").eq("user_id", userId).order("created_at", { ascending: false }).limit(5) : Promise.resolve({ data: [] }),
    userId ? supabase.from("competitors").select("advertiser_id,advertiser_name").eq("user_id", userId).limit(12) : Promise.resolve({ data: [] }),
  ] as const);
  const catalogueAds = (catalogue.data ?? []).map(dbAdToNormalized);
  const trending = catalogueAds.sort((a: NormalizedAd, b: NormalizedAd) => (b.variants * 10 + b.winnerScore) - (a.variants * 10 + a.winnerScore)).slice(0, 5);
  const trackedCompetitors = (competitorRows.data ?? []) as { advertiser_id: string; advertiser_name: string }[];
  const tracked = await Promise.all(trackedCompetitors.map(async (competitor) => {
    const [{ count: activeCount }, { count: weekCount }] = await Promise.all([
      supabase.from("ads").select("*", { count: "exact", head: true }).eq("advertiser_id", competitor.advertiser_id).eq("status", "active"),
      supabase.from("ads").select("*", { count: "exact", head: true }).eq("advertiser_id", competitor.advertiser_id).gte("start_date", week),
    ]);
    return { name: competitor.advertiser_name, advertiserId: competitor.advertiser_id, activeAds: activeCount ?? 0, newThisWeek: weekCount ?? 0 };
  }));
  const savedAdRows = (savedRows.data ?? []) as unknown as { ads: DatabaseAdRow | DatabaseAdRow[] | null }[];
  const mostSaved = savedAdRows.flatMap((row) => row.ads ? [dbAdToNormalized(Array.isArray(row.ads) ? row.ads[0] : row.ads)] : []);
  return { metrics: { totalAds: total.count ?? 0, activeAds: active.count ?? 0, newToday: newToday.count ?? 0, savedAds: saved.count ?? 0, competitors: competitors.count ?? 0, longestRunning: longest.data?.running_days ?? 0, newThisWeek: newWeek.count ?? 0, winningAds: catalogueAds.filter((ad: NormalizedAd) => (ad.runningDays ?? 0) >= 30).length }, topRunning: (top.data ?? []).map(dbAdToNormalized), trending, recent: (recent.data ?? []).map(dbAdToNormalized), mostSaved, competitors: tracked };
}
