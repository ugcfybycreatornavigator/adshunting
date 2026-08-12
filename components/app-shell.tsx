import { Sidebar, MobileHeader } from "@/components/sidebar";
import { HeaderUserMenu } from "@/components/header-user-menu";
import { isSupabaseConfigured } from "@/lib/env";
import { isAnyAdsProviderConfigured } from "@/lib/env/server";
import { isPreviewMode } from "@/lib/preview";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <MobileHeader />
      <main className="min-h-screen lg:pl-60">
        <header className="hidden h-[72px] items-center justify-between border-b border-line bg-white/95 px-8 backdrop-blur lg:flex">
          <div>
            <p className="text-sm font-semibold text-ink">Creative intelligence workspace</p>
            <p className="mt-0.5 text-[11px] font-medium text-muted">Observable signals, saved creatives, and competitor movement</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-line bg-zinc-50 px-3">
              <span className={`size-2 rounded-full ${isAnyAdsProviderConfigured ? "bg-signal" : "bg-zinc-300"}`} />
              <span className="text-xs font-semibold">{isAnyAdsProviderConfigured ? "Provider live" : "Provider setup required"}</span>
            </span>
            <span className="h-5 w-px bg-line" />
            <HeaderUserMenu />
          </div>
        </header>
        {isPreviewMode ? (
          <div className="border-b border-amber-200 bg-amber-50 px-5 py-2.5 text-center text-xs font-medium text-amber-900">
            Guest preview — login is temporarily disabled. Live discovery works; user saves require Supabase tables and authentication.
          </div>
        ) : (!isAnyAdsProviderConfigured || !isSupabaseConfigured) && (
          <div className="border-b border-red-100 bg-red-50 px-5 py-2.5 text-center text-xs font-medium text-signal">
            Configuration mode — add valid environment values to enable {(!isAnyAdsProviderConfigured && !isSupabaseConfigured) ? "live search and persistence" : !isAnyAdsProviderConfigured ? "live provider search" : "authentication and persistence"}.
          </div>
        )}
        <div className="mx-auto w-full max-w-[1680px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">{children}</div>
      </main>
    </div>
  );
}
