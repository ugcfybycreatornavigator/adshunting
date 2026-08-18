import { Card } from "@/components/ui";

export const metadata = { title: "Methodology" };

export default function MethodologySettingsPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="mb-8">
        <h2 className="text-xl font-semibold">Intelligence Methodology</h2>
        <p className="mt-1 text-sm text-muted">How Bucket derives scores from observable ad data.</p>
      </div>

      <div className="space-y-6">
        <Card className="p-6 shadow-sm">
          <h3 className="text-base font-semibold text-ink">Observable Signals</h3>
          <p className="mt-3 text-sm leading-6 text-muted">
            Bucket intelligence is derived strictly from public, observable data points such as:
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 text-sm text-muted">
            <li className="flex items-center gap-2">• Ad longevity</li>
            <li className="flex items-center gap-2">• Active status</li>
            <li className="flex items-center gap-2">• Creative repetition</li>
            <li className="flex items-center gap-2">• Active variants</li>
            <li className="flex items-center gap-2">• Market coverage</li>
            <li className="flex items-center gap-2">• Creative refresh behavior</li>
          </ul>
        </Card>

        <Card className="p-6 shadow-sm">
          <h3 className="text-base font-semibold text-ink">Winner Score Formula</h3>
          <p className="mt-3 text-sm leading-6 text-muted">
            The Winner Score is an aggregate metric calculated dynamically based on the longevity and repetition of the creative across active campaigns. Ads that run longer and are repeated more often score significantly higher.
          </p>
        </Card>

        <Card className="p-6 shadow-sm">
          <h3 className="text-base font-semibold text-ink">Ad Status Logic</h3>
          <p className="mt-3 text-sm leading-6 text-muted">
            An inactive state requires a verified provider status or repeated verified catalogue misses. Temporary provider omissions or API rate limits do not immediately stop an ad’s running clock to prevent false negatives.
          </p>
        </Card>

        <div className="mt-8 rounded-lg bg-surface p-5 text-sm leading-6 text-muted">
          <span className="font-semibold text-ink">Data Limitations:</span> Bucket does not infer or claim private performance metrics. We cannot report on actual CTR, ROAS, conversion rates, spend, or revenue data of any advertiser.
        </div>
      </div>
    </div>
  );
}
