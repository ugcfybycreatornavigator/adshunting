import Link from "next/link";
import { ArrowRight, Search, Store } from "lucide-react";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { BrandCard } from "@/components/brand-card";
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
            className="h-11 w-full rounded-lg border border-line pl-10 pr-4 text-sm outline-none focus:border-brand"
          />
        </form>
      </div>

      <div className="mt-8">
        {brands.length ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
            {brands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
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
