import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DiscoverExperience } from "@/components/discover-experience";
import { PageHeader } from "@/components/ui";
export default async function CompetitorPage({params}:{params:Promise<{id:string}>}){const{id}=await params;return <><Link href="/competitors" className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-ink"><ArrowLeft size={14}/>All competitors</Link><PageHeader eyebrow="Competitor intelligence" title="Advertiser activity" description={`Live ads and observable creative patterns for Meta page ${id}. Metrics populate from the provider and stored catalogue.`}/><div className="mt-1"><DiscoverExperience brandId={id}/></div></>}
