import { SavedAdsView } from "@/components/saved-ads-view";
import { PageHeader } from "@/components/ui";
export const metadata={title:"Saved Ads"};
export default function SavedPage(){return <><PageHeader eyebrow="Your research" title="Saved Ads" description="Every creative you’ve saved, with permanent metadata, notes, tags, and folder membership."/><div className="mt-8"><SavedAdsView/></div></>}
