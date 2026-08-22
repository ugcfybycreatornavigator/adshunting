import { Suspense } from "react";
import { BillingOverview } from "@/components/billing/BillingOverview";
import { BillingSkeleton } from "@/components/billing/BillingSkeleton";
import { Card } from "@/components/ui";

export const metadata = { title: "Payments & Billing" };

export default async function BillingSettingsPage({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  const params = await searchParams;
  const isPaymentRequired = params.reason === "payment_required";

  return (
    <div className="max-w-4xl space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Payments & Billing</h2>
        <p className="mt-1 text-sm text-muted-foreground">Manage your subscription, payment method, and invoices.</p>
      </div>

      {isPaymentRequired && (
        <Card className="border-red-200 bg-red-50 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-red-900">Your AdsHunting subscription needs attention</h3>
          <p className="mt-2 text-sm text-red-700">
            Your trial has ended or we couldn&apos;t confirm your subscription payment.
            Restore your subscription to continue using AdsHunting.
          </p>
        </Card>
      )}

      <Suspense fallback={<BillingSkeleton />}>
        <BillingOverview />
      </Suspense>
    </div>
  );
}
