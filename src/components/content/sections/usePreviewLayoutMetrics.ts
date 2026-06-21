"use client";

import type { CSSProperties } from "react";
import { useInPreviewSection } from "@/components/admin/preview/PreviewSectionContext";
import { useLayoutOverride } from "@/components/content/sections/LayoutOverrideContext";
import {
  defaultLayoutForSectionType,
  resolveLayoutNumerics,
  type SectionLayoutSettings,
} from "@/lib/section-layout";

/** Inline layout metrics for preview studio — bypasses Tailwind var() classes that fail to update live. */
export function usePreviewLayoutMetrics(
  layout: SectionLayoutSettings | null | undefined,
  sectionType: string,
): { isLivePreview: boolean; numerics: ReturnType<typeof resolveLayoutNumerics> } {
  const inPreviewSection = useInPreviewSection();
  const override = useLayoutOverride();
  const effective = override ?? layout;
  const merged = {
    ...defaultLayoutForSectionType(sectionType),
    ...(effective ?? {}),
  };
  const numerics = resolveLayoutNumerics(merged, sectionType, effective);
  return { isLivePreview: inPreviewSection || Boolean(override), numerics };
}

export function previewContentStyle(
  numerics: ReturnType<typeof resolveLayoutNumerics>,
): CSSProperties {
  return { maxWidth: `${numerics.contentWidthPx}px`, width: "100%", marginInline: "auto" };
}

export function previewTextStyle(
  numerics: ReturnType<typeof resolveLayoutNumerics>,
  textAlignment: "left" | "center" = "left",
): CSSProperties {
  return {
    maxWidth: `${numerics.textMaxWidthPx}px`,
    width: "100%",
    textAlign: textAlignment,
    marginInline: textAlignment === "center" ? "auto" : undefined,
  };
}

export function previewImageStyle(numerics: ReturnType<typeof resolveLayoutNumerics>): CSSProperties {
  const height = numerics.imageHeight;
  return {
    width: "100%",
    height: `${height}px`,
    minHeight: `${height}px`,
    aspectRatio: String(numerics.imageAspectRatio),
    position: "relative",
  };
}

export function previewGalleryStyle(numerics: ReturnType<typeof resolveLayoutNumerics>): CSSProperties {
  return { ["--gallery-h" as string]: `${numerics.galleryHeight}px` };
}
