"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { Button, Card } from "@/components/ui";
import { LogOut } from "lucide-react";
import { useState } from "react";

export function SettingsAccount() {
  const { isLoaded, user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const [signingOut, setSigningOut] = useState(false);

  if (!isLoaded || !user) {
    return <div className="h-40 animate-pulse rounded-2xl bg-surface" />;
  }

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut({ redirectUrl: "/sign-in" });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-sm">
        <h3 className="text-base font-semibold">Profile</h3>
        <p className="mt-1 text-sm text-muted">Your personal account information.</p>
        
        <div className="mt-6 flex items-center gap-5">
          <img src={user.imageUrl} alt="Avatar" className="size-16 rounded-full border border-line object-cover" />
          <div className="flex-1">
            <p className="text-sm font-semibold">{user.fullName || "User"}</p>
            <p className="text-sm text-muted">{user.primaryEmailAddress?.emailAddress}</p>
          </div>
          <Button variant="secondary" onClick={() => openUserProfile()}>
            Edit Profile
          </Button>
        </div>
      </Card>

      <Card className="p-6 shadow-sm">
        <h3 className="text-base font-semibold">Account Type</h3>
        <p className="mt-1 text-sm text-muted">Your current account structure.</p>
        <div className="mt-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Personal Account</p>
            <p className="text-sm text-muted">No workspace membership</p>
          </div>
          <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-700">
            Standard
          </span>
        </div>
      </Card>

      <Card className="p-6 shadow-sm">
        <h3 className="text-base font-semibold">Session</h3>
        <p className="mt-1 text-sm text-muted">Manage your active authentication session.</p>
        <div className="mt-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Signed in as</p>
            <p className="text-sm text-muted">{user.primaryEmailAddress?.emailAddress}</p>
          </div>
          <Button variant="secondary" onClick={handleSignOut} disabled={signingOut}>
            <LogOut size={16} className="mr-2" />
            {signingOut ? "Signing out..." : "Sign out"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
