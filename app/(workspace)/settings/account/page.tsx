import { SettingsAccount } from "@/components/settings-account";

export const metadata = { title: "Account Settings" };

export default function AccountSettingsPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="mb-8">
        <h2 className="text-xl font-semibold">My Account</h2>
        <p className="mt-1 text-sm text-muted">Manage your personal profile and account structure.</p>
      </div>
      <SettingsAccount />
    </div>
  );
}
