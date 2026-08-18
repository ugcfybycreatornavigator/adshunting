import { Card } from "@/components/ui";

export const metadata = { title: "Payments & Billing" };

export default function BillingSettingsPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="mb-8">
        <h2 className="text-xl font-semibold">Payments & Billing</h2>
        <p className="mt-1 text-sm text-muted">Manage your billing information, payment methods, and invoices.</p>
      </div>

      <Card className="p-12 text-center shadow-sm">
        <h3 className="text-base font-semibold">Payment setup is not configured yet.</h3>
        <p className="mt-2 text-sm text-muted">
          Your workspace does not have an active billing provider configured.
        </p>
      </Card>
    </div>
  );
}
