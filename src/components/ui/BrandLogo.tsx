"use client";

import Image from "next/image";
import {
  BRAND_LABELS,
  type BrandKey,
  type BrandLogoContext,
  resolveBrandLogoHeightRem,
  shouldUnoptimizeLogoSrc,
} from "@/lib/site-branding";
import { cn } from "@/lib/utils";
import { useSiteBranding } from "@/components/branding/BrandingProvider";

type BrandLogoProps = {
  brand?: BrandKey;
  context?: BrandLogoContext;
  className?: string;
  priority?: boolean;
  widthPx?: number;
  heightPx?: number;
};

export function BrandLogo({
  brand = "nirvanaYoga",
  context = "navbar",
  className,
  priority = false,
  widthPx,
  heightPx,
}: BrandLogoProps) {
  const branding = useSiteBranding();
  const config = branding[brand];
  const heightRem =
    heightPx && heightPx > 0 ? heightPx / 16 : resolveBrandLogoHeightRem(context, config.logoScale);
  const logoSrc = config.logoSrc;

  return (
    <span
      className={cn("inline-flex shrink-0 items-center", className)}
      style={{
        height: `${heightRem}rem`,
        width: widthPx && widthPx > 0 ? `${widthPx}px` : undefined,
      }}
    >
      <Image
        key={logoSrc}
        src={logoSrc}
        alt={BRAND_LABELS[brand]}
        width={320}
        height={120}
        priority={priority}
        className="h-full w-auto max-w-[min(100%,14rem)] object-contain object-left"
        style={{
          width: widthPx && widthPx > 0 ? "100%" : "auto",
          height: "100%",
          maxHeight: "100%",
          objectPosition: "center",
        }}
        unoptimized={shouldUnoptimizeLogoSrc(logoSrc)}
      />
    </span>
  );
}
