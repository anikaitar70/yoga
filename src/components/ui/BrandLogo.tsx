"use client";

import Image from "next/image";
import {
  BRAND_LABELS,
  type BrandKey,
  type BrandLogoContext,
  resolveBrandLogoHeightRem,
} from "@/lib/site-branding";
import { cn } from "@/lib/utils";
import { useSiteBranding } from "@/components/branding/BrandingProvider";

type BrandLogoProps = {
  brand?: BrandKey;
  context?: BrandLogoContext;
  className?: string;
  priority?: boolean;
};

export function BrandLogo({
  brand = "nirvanaYoga",
  context = "navbar",
  className,
  priority = false,
}: BrandLogoProps) {
  const branding = useSiteBranding();
  const config = branding[brand];
  const heightRem = resolveBrandLogoHeightRem(context, config.logoScale);

  return (
    <span
      className={cn("inline-flex shrink-0 items-center", className)}
      style={{ height: `${heightRem}rem` }}
    >
      <Image
        src={config.logoSrc}
        alt={BRAND_LABELS[brand]}
        width={320}
        height={120}
        priority={priority}
        className="h-full w-auto max-w-[min(100%,14rem)] object-contain object-left"
        style={{ width: "auto", height: "100%", maxHeight: "100%" }}
        unoptimized={config.logoSrc.endsWith(".svg")}
      />
    </span>
  );
}
