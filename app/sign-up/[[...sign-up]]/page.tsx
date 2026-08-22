import { SignUp } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth-shell";
import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Create an AdsHunting account",
  description: "Create an AdsHunting account to start your private ad research workspace.",
  path: "/sign-up",
  noIndex: true,
});

const authAppearance = {
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none p-0 bg-transparent",
    card: "w-full shadow-none p-0 bg-transparent border-none",
    header: "hidden",
    socialButtonsBlockButton:
      "h-[50px] w-full border border-[#E4E4E7] bg-white hover:bg-[#F9FAFB] text-[#18181B] font-semibold text-[14px] rounded-[10px] transition-colors shadow-none",
    socialButtonsBlockButtonText: "font-semibold text-[#18181B] text-[14px]",
    dividerRow: "my-[22px] flex items-center gap-3",
    dividerLine: "h-px bg-[#E4E4E7] flex-1",
    dividerText: "text-[11px] font-bold text-[#A1A1AA] uppercase tracking-[.14em]",
    form: "space-y-[18px]",
    formField: "space-y-[8px]",
    formFieldLabel: "text-[13px] font-semibold text-[#18181B]",
    formFieldInput:
      "h-[50px] w-full rounded-[10px] border border-[#E4E4E7] bg-white px-4 text-[14px] text-[#18181B] shadow-none outline-none transition-colors focus:border-[#18181B] focus:ring-1 focus:ring-[#18181B]",
    formButtonPrimary:
      "h-[50px] w-full rounded-[10px] bg-[#111217] text-[14px] font-semibold text-white shadow-none transition-colors hover:bg-[#272A35]",
    formButtonPrimaryIcon: "hidden",
    footer: "mt-6 pt-4 text-center",
    footerActionText: "text-[13px] text-[#71717A]",
    footerActionLink: "ml-1.5 text-[13px] font-semibold text-[#111217] hover:text-brand transition-colors",
    formFieldErrorText: "mt-1.5 text-[12px] font-medium text-[#FF3347]",
    identityPreviewText: "text-[13px] font-medium text-[#18181B]",
    identityPreviewEditButton: "ml-2 text-[13px] font-semibold text-[#111217] hover:text-brand transition-colors",
    otpCodeFieldInput: "h-[50px] w-11 rounded-[10px] border border-[#E4E4E7] text-center text-[18px] font-bold text-[#18181B] focus:border-[#18181B] focus:ring-1 focus:ring-[#18181B]",
    alertText: "text-[#FF3347] text-[13px]",
  },
};

export default function SignUpPage() {
  return (
    <AuthShell mode="sign-up">
      <SignUp appearance={authAppearance} />
    </AuthShell>
  );
}
