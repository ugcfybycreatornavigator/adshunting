import { SwipeFilesManager } from "@/components/swipe-files-manager";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Swipe Files" };

export default function SwipeFilesPage() {
  return (
    <>
      <PageHeader 
        eyebrow="Creative library" 
        title="Swipe Files" 
        description="Organize saved ads by angle, format, competitor, campaign, or anything your team wants to study."
      />
      <div className="mt-8">
        <SwipeFilesManager />
      </div>
    </>
  );
}
