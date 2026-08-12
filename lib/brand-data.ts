import { isSupabaseConfigured } from "@/lib/env";
import { getServerEnv, isSearchConfigured } from "@/lib/env/server";
import { createClient } from "@/lib/supabase/server";
import { SearchApiProvider } from "@/lib/providers/searchapi";

export type BrandData = {
  id: string;
  name: string;
  avatar: string | null;
  active: number;
  inactive: number;
  total: number;
  longest: number;
  earliest: string | null;
  media: Record<string, number>;
  ctas: Record<string, number>;
  platforms: Record<string, number>;
};

type BrandAdRow = {
  advertiser_name: string;
  advertiser_avatar_url: string | null;
  status: string;
  running_days: number | null;
  start_date: string | null;
  media_type: string;
  cta: string | null;
  platforms: string[] | null;
};

export async function getBrandData(id: string): Promise<BrandData> {
  let rows: BrandAdRow[] = [];
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("ads")
      .select("advertiser_name,advertiser_avatar_url,status,running_days,start_date,media_type,cta,platforms")
      .eq("advertiser_id", id)
      .limit(500);
    rows = (data ?? []) as BrandAdRow[];
  }

  let name = rows[0]?.advertiser_name || `Meta advertiser ${id}`;
  let avatar = rows[0]?.advertiser_avatar_url || null;

  if (!rows.length && isSearchConfigured) {
    try {
      const advertiser = await new SearchApiProvider(getServerEnv().searchApiKeys).getAdvertiser(id);
      if (advertiser) {
        name = advertiser.name;
        avatar = advertiser.avatarUrl;
      }
    } catch {}
  }

  const media = countBy(rows.map((row) => row.media_type));
  const ctas = countBy(rows.map((row) => row.cta).filter((cta): cta is string => Boolean(cta)));
  const platforms = countBy(rows.flatMap((row) => row.platforms || []));

  return {
    id,
    name,
    avatar,
    active: rows.filter((r) => r.status === "active").length,
    inactive: rows.filter((r) => r.status === "inactive").length,
    total: rows.length,
    longest: Math.max(0, ...rows.map((r) => r.running_days || 0)),
    earliest: rows.map((r) => r.start_date).filter((date): date is string => Boolean(date)).sort()[0] || null,
    media,
    ctas,
    platforms,
  };
}

export async function getBrands(query?: string) {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  let dbQuery = supabase
    .from("ads")
    .select("advertiser_id,advertiser_name,advertiser_avatar_url,status,start_date")
    .order("last_seen_at", { ascending: false })
    .limit(1000);

  if (query && query.trim()) {
    dbQuery = dbQuery.ilike("advertiser_name", `%${query.trim()}%`);
  }

  const { data } = await dbQuery;
  const map = new Map<string, { id: string; name: string; avatar: string | null; total: number; active: number }>();

  (data ?? []).forEach((row) => {
    const current = map.get(row.advertiser_id);
    map.set(row.advertiser_id, {
      id: row.advertiser_id,
      name: row.advertiser_name,
      avatar: row.advertiser_avatar_url,
      total: (current?.total || 0) + 1,
      active: (current?.active || 0) + (row.status === "active" ? 1 : 0),
    });
  });

  return [...map.values()].sort((a, b) => b.total - a.total);
}

function countBy(items: string[]) {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});
}
