"use client";

import { useLayoutOverride } from "@/components/content/sections/LayoutOverrideContext";
import type { SectionLayoutSettings, SectionTextAlignment } from "@/lib/section-layout";

export function useEffectiveSectionLayout(layout?: SectionLayoutSettings | null): SectionLayoutSettings {
  const override = useLayoutOverride();
  return override ?? layout ?? {};
}

export function sectionHeadingAlign(
  layout?: SectionLayoutSettings | null,
): SectionTextAlignment {
  return layout?.textAlignment === "center" ? "center" : "left";
}
