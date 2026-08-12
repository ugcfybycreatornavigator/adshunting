import { CollectionManager } from "@/components/collection-manager";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Collections" };

export default function CollectionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Creative library"
        title="Collections"
        description="Explore and manage your saved ad collections, swipe files, and creative folders."
      />
      <div className="mt-8">
        <CollectionManager />
      </div>
    </>
  );
}
