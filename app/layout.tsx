import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: `${BRAND.name} — ${BRAND.productLine}`, template: `%s · ${BRAND.name}` },
  description: BRAND.description,
  applicationName: BRAND.name,
  openGraph: {
    title: `${BRAND.name} — ${BRAND.productLine}`,
    description: BRAND.description,
    siteName: BRAND.name,
  },
  twitter: {
    title: `${BRAND.name} — ${BRAND.productLine}`,
    description: BRAND.description,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider signInFallbackRedirectUrl="/dashboard" signUpFallbackRedirectUrl="/dashboard">
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
