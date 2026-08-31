"use client";

import type { CSSProperties } from "react";
import { useInPreviewSection } from "@/components/admin/preview/PreviewSectionContext";
import { useLayoutOverride } from "@/components/content/sections/LayoutOverrideContext";
import {
  defaultLayoutForSectionType,
  resolveLayoutNumerics,
  LAYOUT_TUNING_RANGES,
  type SectionLayoutSettings,
} from "@/lib/section-layout";

/** Inline layout metrics for preview studio — bypasses Tailwind var() classes that fail to update live. */
export function usePreviewLayoutMetrics(
  layout: SectionLayoutSettings | null | undefined,
  sectionType: string,
): { isLivePreview: boolean; numerics: ReturnType<typeof resolveLayoutNumerics> } {
  const inPreviewStudio = useInPreviewSection();
  const override = useLayoutOverride();
  const effective = override ?? layout;
  const merged = {
    ...defaultLayoutForSectionType(sectionType),
    ...(effective ?? {}),
  };
  const numerics = resolveLayoutNumerics(merged, sectionType, effective);

  // Only the preview studio frame should use live-preview rendering paths.
  // Do not treat the public site as preview just because default image metrics exist.
  return { isLivePreview: inPreviewStudio, numerics };
}

export function previewContentStyle(
  numerics: ReturnType<typeof resolveLayoutNumerics>,
): CSSProperties {
  return { maxWidth: `${numerics.contentWidthPx}px`, width: "100%", marginInline: "auto" };
}

export function previewTextStyle(
  numerics: ReturnType<typeof resolveLayoutNumerics>,
  textAlignment: "left" | "center" | "right" | "justify" = "left",
): CSSProperties {
  const style: CSSProperties = {
    maxWidth: `${numerics.textMaxWidthPx}px`,
    width: "100%",
    textAlign: textAlignment as CSSProperties["textAlign"],
  };
  if (textAlignment === "center") (style as unknown as Record<string, unknown>).marginInline = "auto";
  else if (textAlignment === "right") {
    (style as unknown as Record<string, unknown>).marginLeft = "auto";
    (style as unknown as Record<string, unknown>).marginRight = "0";
  }
  return style;
}

export function previewImageStyle(numerics: ReturnType<typeof resolveLayoutNumerics>): CSSProperties {
  const height = Math.max(numerics.imageHeight, LAYOUT_TUNING_RANGES.imageHeight.min);
  const aspect = numerics.imageAspectRatio;
  // Height and aspect ratio are alternative sizing methods — when aspect ratio is non-default, let aspect drive height
  const defaultAspect = 1.78;
  const useAspect = aspect && Math.abs(aspect - defaultAspect) > 0.02;
  if (useAspect) {
    return {
      width: "100%",
      aspectRatio: `${aspect}`,
      position: "relative",
      flexShrink: 0,
    };
  }
  return {
    width: "100%",
    height: `${height}px`,
    minHeight: `${height}px`,
    maxHeight: `${height}px`,
    position: "relative",
    flexShrink: 0,
  };
}

export function previewGalleryStyle(numerics: ReturnType<typeof resolveLayoutNumerics>): CSSProperties {
  return {
    ["--gallery-h" as string]: `${numerics.galleryHeight}px`,
    ["--card-w" as string]: `${numerics.cardWidth}px`,
  };
}
