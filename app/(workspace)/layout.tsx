import { AppShell } from "@/components/app-shell";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { isPreviewMode } from "@/lib/preview";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  if (!isPreviewMode) await auth.protect();
  const authState = await auth();
  if (!authState.userId && !isPreviewMode) redirect("/sign-in");
  return <AppShell>{children}</AppShell>;
}
