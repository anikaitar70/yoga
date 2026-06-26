"use client";

import type { CSSProperties, ReactNode } from "react";
import type { PageSectionType } from "@/lib/page-section-types";
import { LayoutOverrideProvider } from "@/components/content/sections/LayoutOverrideContext";
import { DesignSettingsSectionScope } from "@/components/design/DesignSettingsSectionScope";
import { TimelineStyleOverrideProvider } from "@/components/content/timeline/TimelineStyleOverrideContext";
import { PreviewSectionProvider } from "@/components/admin/preview/PreviewSectionContext";
import {
  defaultLayoutForSectionType,
  layoutToCssVariables,
  mergeLayoutSettings,
  resolveLayoutNumerics,
  sectionFrameSpacingStyle,
  type SectionLayoutSettings,
} from "@/lib/section-layout";
import type { TimelineStyleSettings } from "@/lib/timeline-style";
import { cn } from "@/lib/utils";

type PreviewSectionFrameProps = {
  sectionId: string;
  sectionType: PageSectionType;
  baseLayout: SectionLayoutSettings | null;
  overrideLayout: SectionLayoutSettings;
  overrideTimelineStyle?: TimelineStyleSettings | null;
  selected: boolean;
  isPublished: boolean;
  onSelect: () => void;
  children: ReactNode;
};

export function PreviewSectionFrame({
  sectionType,
  baseLayout,
  overrideLayout,
  overrideTimelineStyle,
  selected,
  isPublished,
  onSelect,
  children,
}: PreviewSectionFrameProps) {
  const merged = mergeLayoutSettings({ ...baseLayout, ...overrideLayout }, sectionType);
  const numerics = resolveLayoutNumerics(
    { ...defaultLayoutForSectionType(sectionType), ...merged },
    sectionType,
    merged,
  );

  const frameStyle: CSSProperties = {
    ...sectionFrameSpacingStyle(merged, sectionType),
    ...layoutToCssVariables(merged, sectionType),
  };

  return (
    <div
      data-preview-section
      data-preview-padding-top={numerics.paddingTop}
      data-preview-padding-bottom={numerics.paddingBottom}
      className={cn(
        "relative transition-[padding,margin] duration-150",
        !isPublished && "ring-2 ring-inset ring-amber-300/80",
        selected && "ring-2 ring-inset ring-slate-900/40",
      )}
      style={frameStyle}
    >
      {!isPublished ? (
        <div className="bg-amber-100 px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-amber-900">
          Draft — not visible on live site
        </div>
      ) : null}
      <button
        type="button"
        onClick={onSelect}
        className="absolute right-3 top-3 z-10 rounded-full border border-slate-300 bg-white/95 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
      >
        {selected ? "Selected" : "Tune layout"}
      </button>
      <PreviewSectionProvider>
        <TimelineStyleOverrideProvider style={overrideTimelineStyle ?? null}>
          <DesignSettingsSectionScope overrides={merged.designOverrides}>
            <LayoutOverrideProvider layout={merged}>{children}</LayoutOverrideProvider>
          </DesignSettingsSectionScope>
        </TimelineStyleOverrideProvider>
      </PreviewSectionProvider>
    </div>
  );
}
