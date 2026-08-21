import { SettingsAccount } from "@/components/settings-account";
import { getWorkspaceEntitlement } from "@/lib/billing/entitlement";
import { createAdminClient } from "@/lib/supabase/admin";
import { auth } from "@clerk/nextjs/server";

export const metadata = { title: "Account Settings" };

export default async function AccountSettingsPage() {
  const { userId } = await auth();
  
  let entitlement = null;
  let subscription = null;
  
  if (userId) {
    entitlement = await getWorkspaceEntitlement(userId);
    const admin = createAdminClient();
    const { data: sub } = await admin
      .from("billing_subscriptions")
      .select("*")
      .eq("workspace_id", userId)
      .maybeSingle();
      
    subscription = sub;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="mb-8">
        <h2 className="text-xl font-semibold">My Account</h2>
        <p className="mt-1 text-sm text-muted">Manage your personal profile and account structure.</p>
      </div>
      <SettingsAccount entitlement={entitlement} subscription={subscription} />
    </div>
  );
}
