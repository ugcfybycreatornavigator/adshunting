import { Card } from "@/components/ui";

export const metadata = { title: "Data & Privacy" };

export default function PrivacySettingsPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="mb-8">
        <h2 className="text-xl font-semibold">Data & Privacy</h2>
        <p className="mt-1 text-sm text-muted">Review Bucket&apos;s privacy posture and media archival policy.</p>
      </div>

      <div className="space-y-6">
        <Card className="p-6 shadow-sm">
          <h3 className="text-base font-semibold">Media Storage</h3>
          <p className="mt-1 text-sm text-muted">Bucket stores permitted creative assets in controlled storage to reduce dependency on temporary provider URLs.</p>
          <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
            <span className="text-sm font-medium">Creative archival</span>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              Connected
            </span>
          </div>
        </Card>

        <Card className="p-6 shadow-sm">
          <h3 className="text-base font-semibold">Authentication</h3>
          <p className="mt-1 text-sm text-muted">Identity and JWT sessions are securely managed by Clerk.</p>
          <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
            <span className="text-sm font-medium">Authentication provider</span>
            <span className="text-sm font-semibold">Clerk</span>
          </div>
        </Card>

        <Card className="p-6 shadow-sm border-red-100 bg-red-50/50">
          <h3 className="text-base font-semibold">Data Handling</h3>
          <div className="mt-3 space-y-2 text-sm text-muted leading-relaxed">
            <p>Provider credentials remain strictly server-side.</p>
            <p>Private keys are never returned to the browser or exposed to the client in any API responses.</p>
          </div>
        </Card>

        <div className="mt-8 rounded-lg bg-surface p-5 text-xs leading-5 text-muted">
          <span className="font-semibold text-ink">Intelligence Limits:</span> Bucket does not claim private advertiser CTR, CPC, ROAS, sales, revenue, or conversion data.
        </div>
      </div>
    </div>
  );
}
