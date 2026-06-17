"use client";

import type { CSSProperties, ReactNode } from "react";
import type { PageSectionType } from "@/lib/page-section-types";
import { LayoutOverrideProvider } from "@/components/content/sections/LayoutOverrideContext";
import { TimelineStyleOverrideProvider } from "@/components/content/timeline/TimelineStyleOverrideContext";
import {
  mergeLayoutSettings,
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
  const frameStyle: CSSProperties = {
    marginBottom: merged.sectionGap ? `${merged.sectionGap}px` : undefined,
  };

  return (
    <div
      className={cn(
        "relative transition-shadow",
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
      <TimelineStyleOverrideProvider style={overrideTimelineStyle ?? null}>
        <LayoutOverrideProvider layout={merged}>{children}</LayoutOverrideProvider>
      </TimelineStyleOverrideProvider>
    </div>
  );
}
