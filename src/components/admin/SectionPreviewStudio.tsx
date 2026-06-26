"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { PageSectionType } from "@/lib/page-section-types";
import { PreviewLayoutPanel } from "@/components/admin/preview/PreviewLayoutPanel";
import { PreviewTimelineStylePanel } from "@/components/admin/preview/PreviewTimelineStylePanel";
import { PreviewSectionFrame } from "@/components/admin/preview/PreviewSectionFrame";
import { PreviewViewport, PreviewViewportToggle } from "@/components/admin/preview/PreviewViewport";
import type { PreviewViewportMode } from "@/lib/preview-viewport";
import type { PreviewLayoutContext } from "@/lib/preview-layout-controls";
import {
  defaultLayoutForSectionType,
  mergeLayoutSettings,
  type SectionLayoutSettings,
} from "@/lib/section-layout";
import { mergeTimelineStyle, type TimelineStyleSettings } from "@/lib/timeline-style";

export type PreviewSectionRecord = {
  id: string;
  sectionType: PageSectionType;
  isPublished: boolean;
  title: string | null;
  layout: SectionLayoutSettings | null;
  timelineStyle?: TimelineStyleSettings | null;
  isTimelineSection?: boolean;
  layoutContext?: PreviewLayoutContext;
};

type SectionElement = {
  id: string;
  sectionType: PageSectionType;
  isPublished: boolean;
  title: string | null;
  node: ReactNode;
};

type SectionPreviewStudioProps = {
  pageTitle: string;
  pageDescription?: string;
  backHref: string;
  backLabel?: string;
  publicPath: string;
  sections: PreviewSectionRecord[];
  sectionElements: SectionElement[];
  onSaveLayout: (sectionId: string, layout: SectionLayoutSettings) => Promise<void>;
  onSaveTimelineStyle?: (sectionId: string, style: TimelineStyleSettings) => Promise<void>;
  shell?: (children: ReactNode) => ReactNode;
  emptyMessage?: string;
};

export function SectionPreviewStudio({
  pageTitle,
  pageDescription = "Tune layout with sliders in real time. Changes stay local until you click Save layout.",
  backHref,
  backLabel = "Back to CMS",
  publicPath,
  sections,
  sectionElements,
  onSaveLayout,
  onSaveTimelineStyle,
  shell,
  emptyMessage = "No sections saved yet. Add sections in the CMS, then preview here.",
}: SectionPreviewStudioProps) {
  const [viewport, setViewport] = useState<PreviewViewportMode>("desktop");
  const [selectedId, setSelectedId] = useState<string | null>(sections[0]?.id ?? null);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [layoutOverrides, setLayoutOverrides] = useState<Record<string, SectionLayoutSettings>>(() => {
    const initial: Record<string, SectionLayoutSettings> = {};
    for (const section of sections) {
      initial[section.id] = mergeLayoutSettings(section.layout, section.sectionType);
    }
    return initial;
  });
  const [timelineStyleOverrides, setTimelineStyleOverrides] = useState<
    Record<string, TimelineStyleSettings>
  >(() => {
    const initial: Record<string, TimelineStyleSettings> = {};
    for (const section of sections) {
      if (section.isTimelineSection) {
        initial[section.id] = mergeTimelineStyle(section.timelineStyle);
      }
    }
    return initial;
  });

  const selectedSection = sections.find((section) => section.id === selectedId) ?? null;
  const selectedLayout =
    selectedId && selectedSection
      ? layoutOverrides[selectedId] ?? mergeLayoutSettings(selectedSection.layout, selectedSection.sectionType)
      : null;
  const selectedTimelineStyle =
    selectedSection?.isTimelineSection && selectedId
      ? timelineStyleOverrides[selectedId] ?? mergeTimelineStyle(selectedSection.timelineStyle)
      : null;
  const draftCount = sections.filter((section) => !section.isPublished).length;

  const sectionMap = useMemo(() => {
    return new Map(sectionElements.map((entry) => [entry.id, entry]));
  }, [sectionElements]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && selectedId && layoutOverrides[selectedId]) {
      console.info("[preview-studio:layout]", {
        sectionId: selectedId,
        layout: layoutOverrides[selectedId],
      });
    }
  }, [layoutOverrides, selectedId]);

  async function saveSelectedLayout() {
    if (!selectedSection) return;
    setBusy(true);
    setMessage(null);
    try {
      const override = layoutOverrides[selectedSection.id];
      const layout = mergeLayoutSettings(
        { ...selectedSection.layout, ...override },
        selectedSection.sectionType,
      );
      await onSaveLayout(selectedSection.id, layout);
      setLayoutOverrides((current) => ({ ...current, [selectedSection.id]: layout }));
      setMessage("Layout saved for this section.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save layout.");
    } finally {
      setBusy(false);
    }
  }

  function resetSelectedLayout() {
    if (!selectedSection) return;
    setLayoutOverrides((current) => ({
      ...current,
      [selectedSection.id]: mergeLayoutSettings(selectedSection.layout, selectedSection.sectionType),
    }));
    setMessage("Section layout reset to saved values.");
  }

  async function saveSelectedTimelineStyle() {
    if (!selectedSection?.isTimelineSection || !selectedId || !onSaveTimelineStyle) return;
    setBusy(true);
    setMessage(null);
    try {
      const style = timelineStyleOverrides[selectedId] ?? mergeTimelineStyle(selectedSection.timelineStyle);
      await onSaveTimelineStyle(selectedId, style);
      setMessage("Timeline style saved for this section.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save timeline style.");
    } finally {
      setBusy(false);
    }
  }

  function resetSelectedTimelineStyle() {
    if (!selectedSection?.isTimelineSection || !selectedId) return;
    setTimelineStyleOverrides((current) => ({
      ...current,
      [selectedId]: mergeTimelineStyle(selectedSection.timelineStyle),
    }));
    setMessage("Timeline style reset to saved values.");
  }

  const previewBody =
    sections.length === 0 ? (
      <div className="px-4 py-16 text-center text-sm text-muted sm:px-6">{emptyMessage}</div>
    ) : (
      sections.map((section) => {
        const entry = sectionMap.get(section.id);
        if (!entry) return null;

        return (
          <PreviewSectionFrame
            key={section.id}
            sectionId={section.id}
            sectionType={section.sectionType}
            baseLayout={section.layout}
            overrideLayout={
              layoutOverrides[section.id] ?? defaultLayoutForSectionType(section.sectionType)
            }
            overrideTimelineStyle={
              section.isTimelineSection
                ? timelineStyleOverrides[section.id] ?? mergeTimelineStyle(section.timelineStyle)
                : null
            }
            selected={selectedId === section.id}
            isPublished={section.isPublished}
            onSelect={() => {
              setSelectedId(section.id);
              setControlsOpen(true);
            }}
          >
            {entry.node}
          </PreviewSectionFrame>
        );
      })
    );

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full">
      <div className="sticky top-0 z-30 border-b border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-950 sm:px-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="font-semibold">Preview studio — {pageTitle}</p>
            <p className="text-amber-900/80">
              {pageDescription}
              {draftCount > 0 ? ` ${draftCount} draft section(s) included.` : ""}
            </p>
            {message ? <p className="mt-1 text-xs font-medium text-amber-950">{message}</p> : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setControlsOpen((open) => !open)}
              className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-white px-4 py-2 text-xs font-semibold text-amber-950 hover:bg-amber-100"
              aria-expanded={controlsOpen}
              aria-label={controlsOpen ? "Close editor menu" : "Open editor menu"}
            >
              <span aria-hidden className="text-base leading-none">
                {controlsOpen ? "✕" : "☰"}
              </span>
              {controlsOpen ? "Close editor" : "Editor"}
            </button>
            <PreviewViewportToggle mode={viewport} onModeChange={setViewport} compact />
            <Link
              href={backHref}
              className="rounded-full border border-amber-300 bg-white px-4 py-2 text-xs font-semibold text-amber-950 hover:bg-amber-100"
            >
              {backLabel}
            </Link>
            <Link
              href={publicPath}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-amber-300 bg-white px-4 py-2 text-xs font-semibold text-amber-950 hover:bg-amber-100"
            >
              View live page
            </Link>
          </div>
        </div>
      </div>

      <div className="w-full min-w-0 overflow-x-hidden bg-background">
        <div className="flex w-full min-w-0 justify-center p-2 sm:p-3">
          <div className="min-w-0 w-full max-w-full">
            <PreviewViewport
              mode={viewport}
              onModeChange={setViewport}
              compact
              showToggle={false}
              maxHeight="none"
              zoom="fit"
            >
              {shell ? shell(previewBody) : previewBody}
            </PreviewViewport>
          </div>
        </div>
      </div>

      {controlsOpen ? (
        <>
          <button
            type="button"
            aria-label="Close editor panel"
            className="fixed inset-0 z-40 bg-slate-900/50"
            onClick={() => setControlsOpen(false)}
          />
          <aside className="fixed inset-0 z-50 flex flex-col bg-white shadow-2xl md:inset-y-0 md:left-auto md:w-full md:max-w-lg md:border-l md:border-slate-200">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">Editor controls</p>
              <button
                type="button"
                onClick={() => setControlsOpen(false)}
                className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
              >
                Close
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              <PreviewLayoutPanel
                sectionId={selectedId}
                sectionType={selectedSection?.sectionType ?? null}
                sectionTitle={selectedSection?.title ?? null}
                baseLayout={selectedSection?.layout ?? null}
                layout={selectedId ? layoutOverrides[selectedId] ?? {} : {}}
                layoutContext={selectedSection?.layoutContext}
                busy={busy}
                onChange={(layout) => {
                  if (!selectedId) return;
                  setLayoutOverrides((current) => ({ ...current, [selectedId]: layout }));
                }}
                onSave={() => void saveSelectedLayout()}
                onReset={resetSelectedLayout}
              />

              {selectedSection?.isTimelineSection && selectedTimelineStyle && onSaveTimelineStyle ? (
                <PreviewTimelineStylePanel
                  sectionTitle={selectedSection.title}
                  style={selectedTimelineStyle}
                  busy={busy}
                  onChange={(style) => {
                    if (!selectedId) return;
                    setTimelineStyleOverrides((current) => ({ ...current, [selectedId]: style }));
                  }}
                  onSave={() => void saveSelectedTimelineStyle()}
                  onReset={resetSelectedTimelineStyle}
                />
              ) : null}
            </div>
          </aside>
        </>
      ) : null}
    </div>
  );
}
