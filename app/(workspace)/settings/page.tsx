import { PageHeader } from "@/components/ui";
import { SettingsView } from "@/components/settings-view";
import { integrationConfig } from "@/lib/env/server";
import { currentUser } from "@clerk/nextjs/server";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress || null;

  return (
    <>
      <PageHeader
        eyebrow="Workspace controls"
        title="Settings"
        description="Review data connections, privacy posture, media archival policy, and your authenticated session."
      />
      <div className="mt-8">
        <SettingsView configured={integrationConfig()} email={email} />
      </div>
    </>
  );
}
