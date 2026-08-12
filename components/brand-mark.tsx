import Link from "next/link";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandMark({
  href = "/dashboard",
  compact = false,
  className,
}: {
  href?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5", className)} aria-label="Runlytics dashboard">
      <span className="relative grid size-9 shrink-0 place-items-center rounded-lg bg-black text-white shadow-sm">
        <span className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-white bg-signal" />
        <Activity size={17} strokeWidth={2.4} />
      </span>
      <span className="min-w-0">
        <span className="block text-[19px] font-extrabold leading-none tracking-[-.045em] text-black">Runlytics</span>
        {!compact && <span className="mt-1 block text-[10px] font-bold uppercase tracking-[.16em] text-zinc-400">Ads Intelligence</span>}
      </span>
    </Link>
  );
}
