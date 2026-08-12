import { SignIn } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth-shell";

const authAppearance = {
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none p-0 bg-transparent",
    card: "w-full shadow-none p-0 bg-transparent border-none",
    header: "hidden",
    socialButtonsBlockButton:
      "h-12 w-full border border-line hover:bg-zinc-50 text-ink font-semibold text-sm rounded-lg transition-colors shadow-none",
    socialButtonsBlockButtonText: "font-semibold text-ink text-sm",
    dividerRow: "my-5 flex items-center gap-3",
    dividerLine: "h-px bg-line flex-1",
    dividerText: "text-[11px] font-bold text-zinc-400 uppercase tracking-[.14em]",
    form: "space-y-4",
    formField: "space-y-1.5",
    formFieldLabel: "text-xs font-semibold text-ink",
    formFieldInput:
      "h-12 w-full rounded-lg border border-line bg-white px-3.5 text-sm text-ink shadow-none outline-none transition-colors focus:border-signal focus:ring-1 focus:ring-signal",
    formButtonPrimary:
      "h-12 w-full rounded-lg bg-signal text-sm font-semibold text-white shadow-none transition-colors hover:bg-signal-dark",
    formButtonPrimaryIcon: "hidden",
    footer: "mt-5 border-t border-line pt-4 text-center",
    footerActionText: "text-xs text-muted",
    footerActionLink: "ml-1 text-xs font-semibold text-signal hover:text-signal-dark hover:underline",
    formFieldErrorText: "mt-1 text-xs font-medium text-signal",
    identityPreviewText: "text-xs font-medium text-ink",
    identityPreviewEditButton: "ml-2 text-xs font-semibold text-signal hover:underline",
    otpCodeFieldInput: "h-12 w-10 rounded-lg border border-line text-center text-lg font-bold text-ink focus:border-signal",
  },
};

export default function SignInPage() {
  return (
    <AuthShell mode="sign-in">
      <SignIn appearance={authAppearance} />
    </AuthShell>
  );
}
