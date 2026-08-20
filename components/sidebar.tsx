"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { House, Compass, FolderHeart, Share2, Radar, Building2, Settings, Menu, X, MoreHorizontal, LogOut } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/utils";
import { useClerk, useUser } from "@clerk/nextjs";

const navGroups = [
  {
    label: "Workspace",
    items: [
      ["Home", "/dashboard", House],
      ["Discover Ads", "/discover", Compass],
      ["Swipe Files", "/swipe-files", FolderHeart],
      ["Shared Ads", "/shared-ads", Share2],
    ] as const,
  },
  {
    label: "Intelligence",
    items: [
      ["Competitors", "/competitors", Radar],
      ["Brands", "/brands", Building2],
    ] as const,
  },
  {
    label: "System",
    items: [
      ["Settings", "/settings", Settings],
    ] as const,
  },
];

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-white px-4 lg:hidden">
        <BrandMark compact />
        <button
          aria-label="Open navigation"
          className="flex size-10 items-center justify-center rounded-lg border border-line text-ink"
          onClick={() => setOpen(true)}
        >
          <Menu size={20} />
        </button>
      </header>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex h-full w-[min(88vw,300px)] flex-col bg-[#0B0D12] px-4 pb-4 border-r border-white/5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-[72px] items-center justify-between pl-3 pr-1 pt-4">
              <BrandMark inverted />
              <button
                aria-label="Close navigation"
                className="flex size-10 items-center justify-center text-[#A1A1AA] hover:text-white transition"
                onClick={() => setOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pt-4 scrollbar-hide">
              <Navigation onNavigate={() => setOpen(false)} />
            </div>
            <div className="mt-4 pt-4">
              <SidebarProfile />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[252px] flex-col border-r border-white/[0.07] bg-[#0B0D12] px-4 pb-4 lg:flex">
      <div className="flex h-[72px] items-center pl-3 pt-4">
        <BrandMark inverted />
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden pt-[16px] scrollbar-hide">
        <Navigation />
      </div>
      <div className="mt-4 pt-4">
        <SidebarProfile />
      </div>
    </aside>
  );
}

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary navigation" className="flex flex-col gap-[20px]">
      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="mb-[6px] px-3 text-[10px] font-semibold uppercase tracking-[.12em] text-[#626774]">
            {group.label}
          </p>
          <ul className="space-y-[3px]">
            {group.items.map(([label, href, Icon]) => {
              const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`));
              
              return (
                <li key={href}>
                  <Link
                    onClick={onNavigate}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex h-[42px] items-center gap-[11px] rounded-[10px] px-3 transition-all duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-1 focus-visible:ring-offset-[#0B0D12]",
                      active
                        ? "text-[#FFFFFF] border border-[#68B32F]/15"
                        : "text-[#A0A4AE] hover:bg-white/[0.045] hover:text-[#F4F4F5] border border-transparent"
                    )}
                    style={active ? {
                      background: "linear-gradient(90deg, rgba(104, 179, 47, 0.16) 0%, rgba(104, 179, 47, 0.07) 35%, rgba(255,255,255,0.055) 100%)"
                    } : undefined}
                  >
                    {active && <div className="absolute left-0 top-0 bottom-0 w-[2px] rounded-r-full bg-[#68B32F]" />}
                    <Icon size={18} strokeWidth={1.8} className={cn("shrink-0 transition-colors duration-150", active ? "text-[#68B32F]" : "text-[#767C89] group-hover:text-[#C5C8CF]")} />
                    <span className={cn("truncate", active ? "font-semibold text-[14px]" : "font-medium text-[14px]")}>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function SidebarProfile() {
  const { isLoaded, user } = useUser();
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isLoaded) {
    return <div className="h-[58px] animate-pulse rounded-[12px] bg-[#12151C] border-t border-white/[0.07]" />;
  }

  if (!user) return null;

  return (
    <div className="relative w-full" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="group relative flex w-full items-center gap-3 rounded-[12px] pt-[12px] pb-[10px] px-[10px] transition duration-150 hover:bg-[#151820] border-t border-white/[0.07] bg-transparent text-left outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-1 focus-visible:ring-offset-[#0B0D12]"
        style={isOpen ? { backgroundColor: "#171A22" } : {}}
      >
        <img
          src={user.imageUrl}
          alt=""
          className="size-[34px] shrink-0 rounded-full border border-white/10 object-cover bg-[#1A1D24]"
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <p className="truncate text-[13px] font-semibold text-[#F7F7F8]">
            {user.fullName || user.primaryEmailAddress?.emailAddress?.split('@')[0] || "User"}
          </p>
          <p className="truncate text-[11px] text-[#777C88]">
            Personal account
          </p>
        </div>
        <MoreHorizontal size={16} className={cn("transition-colors", isOpen ? "text-[#F7F7F8]" : "text-[#6F7380] group-hover:text-[#A1A1AA]")} />
      </button>

      {isOpen && (
        <div 
          className="absolute bottom-[calc(100%+8px)] left-0 z-[100] w-[260px] rounded-[14px] border border-[#E5E7EB] bg-white p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] animate-in fade-in zoom-in-95 duration-100"
          role="menu"
        >
          <div className="flex items-center gap-3 px-2 pb-3 pt-2">
            <img src={user.imageUrl} alt="" className="size-[36px] rounded-full border border-line object-cover bg-zinc-50" />
            <div className="flex flex-col min-w-0">
              <span className="truncate text-[13.5px] font-semibold text-[#111216]">
                {user.fullName || "User"}
              </span>
              <span className="truncate text-[12px] text-[#71717A]">
                {user.primaryEmailAddress?.emailAddress}
              </span>
            </div>
          </div>
          <div className="h-px w-full bg-[#ECEDEF] my-1" />
          <div className="flex flex-col gap-0.5">
            <Link
              href="/settings/account"
              onClick={() => setIsOpen(false)}
              className="flex h-[42px] w-full items-center gap-2.5 rounded-[10px] px-2.5 text-[13px] font-medium text-[#3F3F46] transition hover:bg-[#F5F5F6] hover:text-[#111216] group outline-none focus-visible:ring-2 focus-visible:ring-signal"
              role="menuitem"
            >
              <Settings size={16} className="text-[#71717A] group-hover:text-[#111216] transition" />
              Manage account
            </Link>
            <button
              onClick={() => {
                setIsOpen(false);
                signOut();
              }}
              className="flex h-[42px] w-full items-center gap-2.5 rounded-[10px] px-2.5 text-[13px] font-medium text-[#3F3F46] transition hover:bg-[#FFF1F2] hover:text-[#DC2626] group outline-none focus-visible:ring-2 focus-visible:ring-signal"
              role="menuitem"
            >
              <LogOut size={16} className="text-[#71717A] group-hover:text-[#DC2626] transition" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
