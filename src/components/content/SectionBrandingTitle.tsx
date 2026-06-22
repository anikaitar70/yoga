"use client";

import Image from "next/image";
import { hasSectionLogo, type SectionBranding } from "@/lib/section-branding";
import { cn } from "@/lib/utils";

type SectionBrandingTitleProps = {
  branding?: SectionBranding;
  title: string;
  className?: string;
  logoClassName?: string;
};

/** Renders an optional section logo or falls back to text title. */
export function SectionBrandingTitle({
  branding,
  title,
  className,
  logoClassName,
}: SectionBrandingTitleProps) {
  if (hasSectionLogo(branding)) {
    const src = branding!.sectionLogoSrc!;
    return (
      <div className={cn("inline-flex max-w-full", className)}>
        <Image
          src={src}
          alt={branding?.sectionLogoAlt?.trim() || title}
          width={320}
          height={80}
          className={cn("h-auto max-h-16 w-auto max-w-[min(100%,16rem)] object-contain object-left", logoClassName)}
          unoptimized={src.startsWith("/uploads/") || src.endsWith(".svg")}
        />
      </div>
    );
  }

  return <span className={className}>{title}</span>;
}
