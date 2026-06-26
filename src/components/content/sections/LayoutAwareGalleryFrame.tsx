"use client";

import type { ReactNode } from "react";
import type { SectionLayoutSettings } from "@/lib/section-layout";
import { previewGalleryStyle, usePreviewLayoutMetrics } from "@/components/content/sections/usePreviewLayoutMetrics";
import { cn } from "@/lib/utils";

type LayoutAwareGalleryFrameProps = {
  layout?: SectionLayoutSettings | null;
  children: ReactNode;
  className?: string;
  sectionType?: string;
};

export function LayoutAwareGalleryFrame({
  layout,
  children,
  className,
  sectionType = "GALLERY",
}: LayoutAwareGalleryFrameProps) {
  const { isLivePreview, numerics } = usePreviewLayoutMetrics(layout, sectionType);

  return (
    <div
      className={cn(className)}
      style={isLivePreview ? previewGalleryStyle(numerics) : { ["--gallery-h" as string]: `${numerics.galleryHeight}px`, ["--card-w" as string]: `${numerics.cardWidth}px` }}
    >
      {children}
    </div>
  );
}
