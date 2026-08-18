import Link from "next/link";
import { BucketIcon } from "@/components/bucket-icon";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function BrandMark({
  href = "/dashboard",
  className,
  inverted = false,
}: {
  href?: string;
  compact?: boolean;
  className?: string;
  inverted?: boolean;
}) {
  return (
    <Link href={href} className={cn("inline-flex h-[58px] items-center gap-[12px]", className)} aria-label={`${BRAND.name} Home`}>
      <span className={cn(
        "relative grid size-[34px] shrink-0 place-items-center rounded-[8px] shadow-sm",
        inverted ? "bg-white text-black" : "bg-[#FF3347] text-white"
      )}>
        <BucketIcon size={20} />
      </span>
      <span className={cn(
        "text-[17px] font-[650] tracking-tight",
        inverted ? "text-white" : "text-current"
      )}>
        {BRAND.name}
      </span>
    </Link>
  );
}
