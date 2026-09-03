"use client";

import type { EventPageSectionRecord } from "@/lib/event-page-section";
import { eventPageSectionToPageSectionRecord } from "@/lib/event-page-section";
import { SectionPreviewStudio } from "@/components/admin/SectionPreviewStudio";
import { ClientSectionPreview } from "@/components/admin/preview/ClientSectionPreview";
import { adminJsonRequest } from "@/lib/admin-fetch";
import type { SectionLayoutSettings } from "@/lib/section-layout";

type Props = {
  eventId: string;
  eventSlug: string;
  publicPath: string;
  sections: EventPageSectionRecord[];
};

export function SpecialEventPreviewStudio({ eventId, publicPath, sections }: Props) {
  const previewSections = sections.map((s) => {
    const rec = eventPageSectionToPageSectionRecord(s);
    return {
      id: s.id,
      sectionType: s.sectionType,
      isPublished: s.isPublished,
      title: s.title,
      layout: s.layout,
      isTimelineSection: false,
      timelineStyle: null,
      layoutContext: { pageType: "ABOUT" as const, customTextVariant: (rec.payload as { variant?: string })?.variant, hasImage: Boolean(rec.imageUrl) } as unknown as import("@/lib/preview-layout-controls").PreviewLayoutContext,
      original: rec,
    };
  });

  return (
    <SectionPreviewStudio
      pageTitle={`Special Event — ${sections.length} section(s)`}
      pageDescription="Tune layout with sliders + numeric inputs (same values as Program Pages). Changes preview live until Save layout."
      backHref={`/admin/special-events/${eventId}`}
      backLabel="Back to editor"
      publicPath={publicPath}
      sections={previewSections.map((p) => ({
        id: p.id,
        sectionType: p.sectionType as never,
        isPublished: p.isPublished,
        title: p.title,
        layout: p.layout as never,
        isTimelineSection: p.isTimelineSection,
        timelineStyle: p.timelineStyle,
        layoutContext: p.layoutContext,
      }))}
      sectionElements={previewSections.map((p, index) => ({
        id: p.id,
        sectionType: p.sectionType as never,
        isPublished: p.isPublished,
        title: p.title,
        node: <ClientSectionPreview section={p.original} pageType="ABOUT" sectionIndex={index} data={{}} />,
      }))}
      onSaveLayout={async (sectionId, layout: SectionLayoutSettings) => {
        await adminJsonRequest(`/api/events/${eventId}/page-sections/${sectionId}`, "PUT", { layout });
      }}
      shell={(children) => <div className="bg-background text-foreground">{children}</div>}
    />
  );
}
