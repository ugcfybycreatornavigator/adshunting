import { CompetitorManager } from "@/components/competitor-manager";
import { PageHeader } from "@/components/ui";
export const metadata={title:"Competitors"};
export default function CompetitorsPage(){return <><PageHeader eyebrow="Market watch" title="Competitors" description="Track advertiser launch velocity, creative longevity, format mix, and recurring angles from observable activity."/><div className="mt-8"><CompetitorManager/></div></>}
