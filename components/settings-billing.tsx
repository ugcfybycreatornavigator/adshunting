"use client";

import { Card, Button } from "@/components/ui";
import { type WorkspaceEntitlement } from "@/lib/billing/subscription-state";
import { type PlanConfig, type PlanKey } from "@/lib/billing/billing-config";
import { type WorkspaceUsage } from "@/lib/billing/usage";
import { type PlanEntitlements } from "@/lib/billing/limits";
import { useState } from "react";
import { cancelSubscription } from "@/app/(workspace)/settings/billing/actions";

interface SettingsBillingProps {
  entitlement: WorkspaceEntitlement;
  planConfig: PlanConfig;
  planKey: PlanKey;
  usage: WorkspaceUsage;
  limits: PlanEntitlements;
}

export function SettingsBilling({ entitlement, planConfig, usage, limits }: SettingsBillingProps) {
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayPlanName = planConfig?.name || "No active plan";
  const isTrial = entitlement.accessSource === "trial";
  
  const renewsDate = entitlement.currentPeriodEnd 
    ? new Date(entitlement.currentPeriodEnd).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) 
    : null;

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your membership? You will retain access until the end of your billing period.")) {
      return;
    }
    
    setCancelling(true);
    setError(null);
    const res = await cancelSubscription();
    if (res.error) {
      setError(res.error);
      setCancelling(false);
    } else {
      window.location.reload();
    }
  };

  const usagePercent = (current: number, limit: number | "unlimited") => {
    if (limit === "unlimited") return current > 0 ? 5 : 0;
    if (current === 0) return 0;
    return Math.min(100, Math.round((current / limit) * 100));
  };

  return (
    <div className="space-y-6 max-w-[760px]">
      <div className="mb-8">
        <h2 className="text-[18px] font-semibold text-[#18181B]">Billing</h2>
        <p className="mt-1 text-[14px] text-[#71717A]">Manage your membership and account usage.</p>
      </div>

      <Card className="p-6 shadow-sm border border-[#E1E1E1] rounded-[12px]">
        <h3 className="text-[15px] font-semibold text-[#18181B]">Current plan</h3>
        
        <div className="mt-4 border border-[#E1E1E1] rounded-[10px] p-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
             <div>
               <h4 className="text-[18px] font-semibold text-[#18181B]">{displayPlanName}</h4>
               <p className="text-[13px] text-[#71717A] mt-1">Status: <span className="font-medium text-[#18181B]">{entitlement.billingStatus === "active" && !isTrial ? "Active" : isTrial ? "Trial" : entitlement.billingStatus === "cancelled" ? "Cancelled" : "Inactive"}</span></p>
               <p className="text-[13px] text-[#71717A] mt-1">Price: {planConfig.currentPrice ? `₹${planConfig.currentPrice} / month` : planConfig.priceLabel || "Free"}</p>
               
               {renewsDate && entitlement.billingStatus === "active" && (
                 <p className="text-[13px] text-[#71717A] mt-1">Next billing date: {renewsDate}</p>
               )}
               {renewsDate && entitlement.billingStatus === "cancelled" && (
                 <p className="text-[13px] text-[#71717A] mt-1">Access valid until: {renewsDate}</p>
               )}
             </div>
          </div>
          
          <div className="mt-6 pt-5 border-t border-[#E1E1E1]">
            <Button variant="secondary" className="h-[36px] text-[13px] font-medium" disabled={planConfig.id !== "scout"}>
               {planConfig.id === "scout" ? "Upgrade membership" : "Change plan"}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 shadow-sm border border-[#E1E1E1] rounded-[12px]">
        <h3 className="text-[15px] font-semibold text-[#18181B]">Usage</h3>
        
        <div className="mt-6 space-y-6">
           <div>
             <div className="flex justify-between text-[13px] mb-2">
               <span className="font-medium text-[#18181B]">Swipe Files</span>
               <span className="text-[#71717A]">{usage.swipeFiles} / {limits.swipeFiles === "unlimited" ? "Unlimited" : limits.swipeFiles}</span>
             </div>
             <div className="w-full h-2 bg-[#F4F4F5] rounded-full overflow-hidden">
               <div className="h-full bg-signal" style={{ width: `${usagePercent(usage.swipeFiles, limits.swipeFiles)}%` }} />
             </div>
           </div>
           
           <div>
             <div className="flex justify-between text-[13px] mb-2">
               <span className="font-medium text-[#18181B]">Shared Ads</span>
               <span className="text-[#71717A]">{usage.sharedAds} / {limits.sharedAds === "unlimited" ? "Unlimited" : limits.sharedAds}</span>
             </div>
             <div className="w-full h-2 bg-[#F4F4F5] rounded-full overflow-hidden">
               <div className="h-full bg-signal" style={{ width: `${usagePercent(usage.sharedAds, limits.sharedAds)}%` }} />
             </div>
           </div>
           
           <div>
             <div className="flex justify-between text-[13px] mb-2">
               <span className="font-medium text-[#18181B]">Team Members</span>
               <span className="text-[#71717A]">{usage.teamMembers} / {limits.teamMembers === "unlimited" ? "Unlimited" : limits.teamMembers}</span>
             </div>
             <div className="w-full h-2 bg-[#F4F4F5] rounded-full overflow-hidden">
               <div className="h-full bg-signal" style={{ width: `${usagePercent(usage.teamMembers, limits.teamMembers)}%` }} />
             </div>
           </div>
        </div>
      </Card>

      <Card className="p-6 shadow-sm border border-[#E1E1E1] rounded-[12px]">
        <h3 className="text-[15px] font-semibold text-[#18181B]">Subscription</h3>
        <div className="mt-4 flex flex-col gap-3">
          <Button variant="secondary" className="justify-center h-[36px] w-full sm:w-auto text-[13px] font-medium bg-white">
            Manage membership
          </Button>
          {entitlement.billingStatus === "active" && !isTrial && (
            <Button variant="secondary" className="justify-center h-[36px] w-full sm:w-auto text-[13px] font-medium text-red-600 hover:text-red-700 bg-white" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? "Cancelling..." : "Cancel membership"}
            </Button>
          )}
          {error && <p className="text-red-600 text-[12px]">{error}</p>}
        </div>
      </Card>
    </div>
  );
}
