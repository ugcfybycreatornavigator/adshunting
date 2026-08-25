import { SettingsBilling } from "@/components/settings-billing";
import { getWorkspaceEntitlement } from "@/lib/billing/entitlement";
import { BILLING_CONFIG, resolvePlanKey } from "@/lib/billing/billing-config";
import { getWorkspaceUsage } from "@/lib/billing/usage";
import { resolveWorkspaceAccess } from "@/lib/billing/limits";
import { createAdminClient } from "@/lib/supabase/admin";
import { auth } from "@clerk/nextjs/server";

export const metadata = { title: "Payments & Billing" };

export default async function BillingSettingsPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const entitlement = await getWorkspaceEntitlement(userId);
  const admin = createAdminClient();
  const { data: sub } = await admin
    .from("billing_subscriptions")
    .select("*")
    .eq("workspace_id", userId)
    .maybeSingle();

  const planKey = resolvePlanKey(sub?.plan_key as string);
  const planConfig = BILLING_CONFIG[planKey];
  const usage = await getWorkspaceUsage(userId);
  const limits = resolveWorkspaceAccess(entitlement, planKey);

  return (
    <SettingsBilling 
       entitlement={entitlement}
       planConfig={planConfig}
       planKey={planKey}
       usage={usage}
       limits={limits}
    />
  );
}
