import { DiscoverExperience } from "@/components/discover-experience";
import { BrandSummary } from "@/components/brand-profile";
import { PageHeader } from "@/components/ui";
import { getBrandData } from "@/lib/brand-data";
import { BrandWebIntelligence } from "@/components/brand-web-intelligence";
import { isGoogleSearchConfigured } from "@/lib/env/server";
export default async function BrandPage({params}:{params:Promise<{id:string}>}){const{id}=await params;const data=await getBrandData(id);return <><PageHeader eyebrow="Brand intelligence" title={data.name} description="Observable creative activity, longevity, format choices, calls to action, and live advertisements." actions={data.avatar?<img src={data.avatar} alt="" className="size-14 rounded-full border border-line object-cover"/>:undefined}/><BrandSummary data={data}/><BrandWebIntelligence brandName={data.name} configured={isGoogleSearchConfigured}/><div className="mt-10 border-t border-line pt-9"><h2 className="text-xl font-semibold tracking-tight">Creative catalogue</h2><DiscoverExperience brandId={id}/></div></>}
