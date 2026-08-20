import React, { SVGProps } from "react";

export interface AdsHuntingLogoProps extends Omit<SVGProps<SVGSVGElement>, "width" | "height"> {
  variant?: "full" | "mark";
  surface?: "dark" | "light" | "auto";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export function AdsHuntingLogo({
  variant = "full",
  surface = "auto",
  size = "md",
  className = "",
  ...props
}: AdsHuntingLogoProps) {
  const sizeMap = {
    xs: 16,
    sm: 20,
    md: 28,
    lg: 36,
    xl: 48,
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const isMark = variant === "mark";

  // If surface is dark, we want white logo text/mark. If light, dark logo.
  // Using explicit variables instead of text color utility classes to ensure it doesn't get overridden by a parent container's arbitrary text-foreground.
  const isDarkSurface = surface === "dark";
  const primaryColor = isDarkSurface ? "#FFFFFF" : "#0F172A"; // White for dark surface, Slate-900 for light surface
  const accentColor = "#E11D2E"; // Brand Red

  const markSvg = (
    <svg
      width={currentSize}
      height={currentSize}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="flex-none transition-transform duration-200 group-hover:scale-[1.02]"
      {...props}
    >
      {/* Search aperture / Tracking arc */}
      <path
        d="M26 16A10 10 0 0 1 16 26"
        stroke={accentColor}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      
      {/* A + H Monogram */}
      <path
        d="M16 6L7 24M16 6L25 24"
        stroke={primaryColor}
        strokeWidth="4"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      {/* H crossbar */}
      <path
        d="M10 17H22"
        stroke={primaryColor}
        strokeWidth="3.5"
        strokeLinecap="square"
      />
      
      {/* Signal dot */}
      <circle cx="16" cy="12" r="2.5" fill={accentColor} className="transition-opacity duration-200 group-hover:opacity-100 opacity-90" />
    </svg>
  );

  if (isMark) {
    return <div className={`inline-flex items-center justify-center ${className}`.trim()}>{markSvg}</div>;
  }

  return (
    <div
      className={`group inline-flex items-center gap-[10px] whitespace-nowrap overflow-visible ${className}`.trim()}
      aria-label="Ads Hunting"
    >
      {markSvg}
      <span
        className="font-[650] tracking-tight whitespace-nowrap leading-none transition-opacity duration-200"
        style={{ 
          fontSize: `${Math.max(currentSize * 0.55, 14.5)}px`,
          color: primaryColor,
          letterSpacing: "-0.015em"
        }}
      >
        Ads Hunting
      </span>
    </div>
  );
}
