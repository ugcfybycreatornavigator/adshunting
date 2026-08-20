import Link from "next/link";
import { ArrowRight, Search, Store } from "lucide-react";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { getBrands } from "@/lib/brand-data";

export const metadata = { title: "Brands" };

export default async function BrandsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() || "";
  const brands = await getBrands(query);

  return (
    <>
      <PageHeader
        eyebrow="Advertiser index"
        title="Brands"
        description="Explore advertiser-level creative systems, launch patterns, CTA preferences, and platform distribution."
      />

      <div className="mt-6 max-w-md">
        <form method="GET" action="/brands" className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search brands or advertisers..."
            className="h-11 w-full rounded-lg border border-line pl-10 pr-4 text-sm outline-none focus:border-signal"
          />
        </form>
      </div>

      <div className="mt-8">
        {brands.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {brands.map((brand) => (
              <Link href={`/brands/${encodeURIComponent(brand.id)}`} key={brand.id}>
                <Card className="flex items-center gap-4 p-5 shadow-none transition hover:-translate-y-0.5 hover:shadow-card">
                  {brand.avatar ? (
                    <img
                      src={brand.avatar}
                      alt=""
                      className="size-12 rounded-full border border-line object-cover"
                    />
                  ) : (
                    <span className="grid size-12 place-items-center rounded-full bg-black font-bold text-white">
                      {brand.name[0]}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{brand.name}</p>
                    <p className="mt-1 text-xs text-muted">
                      {brand.active} active · {brand.total} tracked
                    </p>
                  </div>
                  <ArrowRight size={16} />
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Store />}
            title={query ? "No matching brands found" : "No brands tracked yet"}
            body={
              query
                ? `No advertiser matching "${query}" was found in your catalogue.`
                : "Brands appear automatically as live ads are saved into your intelligence catalogue."
            }
          />
        )}
      </div>
    </>
  );
}
