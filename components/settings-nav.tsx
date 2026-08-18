"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { User, Server, ShieldCheck, Activity } from "lucide-react";

const navGroups = [
  {
    label: "ACCOUNT & WORKSPACE",
    items: [
      { name: "My Account", href: "/settings/account", icon: User },
    ],
  },
  {
    label: "BILLING",
    items: [
      { name: "Payments & Billing", href: "/settings/billing", icon: Server },
    ],
  },
  {
    label: "PRIVACY & SYSTEM",
    items: [
      { name: "Data & Privacy", href: "/settings/privacy", icon: ShieldCheck },
      { name: "Methodology", href: "/settings/methodology", icon: Activity },
    ],
  },
];

export function SettingsNav() {
  const pathname = usePathname();
  const router = useRouter();

  // Mobile select handler
  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(e.target.value);
  };

  return (
    <>
      {/* Mobile Nav */}
      <div className="md:hidden relative mb-6">
        <select
          value={pathname}
          onChange={handleSelect}
          className="w-full h-12 appearance-none rounded-xl border border-line bg-white px-4 pr-10 text-sm font-semibold text-ink outline-none focus:ring-2 focus:ring-signal"
        >
          {navGroups.flatMap(g => g.items).map((item) => (
            <option key={item.href} value={item.href}>
              {item.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted">
          <ChevronDown size={16} />
        </div>
      </div>

      {/* Desktop Nav */}
      <nav className="hidden md:flex w-[220px] lg:w-[240px] shrink-0 flex-col gap-6 sticky top-[32px]">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
              {group.label}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex h-[40px] items-center gap-3 rounded-[10px] px-3 text-[14px] transition-colors",
                        active
                          ? "bg-red-50 text-ink font-semibold"
                          : "text-[#525866] hover:bg-[#F5F6F8] font-medium"
                      )}
                    >
                      <item.icon size={16} className={cn(active ? "text-signal" : "text-muted")} />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </>
  );
}
