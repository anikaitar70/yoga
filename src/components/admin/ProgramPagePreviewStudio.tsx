"use client";

import type { PageSectionRecord, PageType } from "@/lib/page-section-types";
import { PAGE_TYPE_LABELS } from "@/lib/page-section-types";
import { AboutPagePreviewShell } from "@/components/admin/preview/AboutPagePreviewShell";
import { ProgramPageShell } from "@/components/program/ProgramPageShell";
import { SectionPreviewStudio } from "@/components/admin/SectionPreviewStudio";
import {
  ClientSectionPreview,
  type ClientSectionPreviewData,
} from "@/components/admin/preview/ClientSectionPreview";
import { adminJsonRequest } from "@/lib/admin-fetch";
import type { SectionLayoutSettings } from "@/lib/section-layout";
import type { TimelineStyleSettings } from "@/lib/timeline-style";
import type { CustomTextSectionPayload } from "@/lib/page-section-types";
import type { PreviewLayoutContext } from "@/lib/preview-layout-controls";

type EnrichedPreviewSection = {
  section: PageSectionRecord;
  isTimelineSection?: boolean;
  timelineStyle?: TimelineStyleSettings | null;
  layoutContext?: PreviewLayoutContext;
  previewData: ClientSectionPreviewData;
};

type ProgramPagePreviewStudioProps = {
  pageType: PageType;
  sections: EnrichedPreviewSection[];
  publicPath: string;
};

export function ProgramPagePreviewStudio({
  pageType,
  sections,
  publicPath,
}: ProgramPagePreviewStudioProps) {
  return (
    <SectionPreviewStudio
      pageTitle={PAGE_TYPE_LABELS[pageType]}
      backHref="/admin/pages"
      publicPath={publicPath}
      sections={sections.map((entry) => ({
        id: entry.section.id,
        sectionType: entry.section.sectionType,
        isPublished: entry.section.isPublished,
        title: entry.section.title,
        layout: entry.section.layout,
        isTimelineSection: entry.isTimelineSection,
        timelineStyle: entry.timelineStyle,
        layoutContext: entry.layoutContext,
      }))}
      sectionElements={sections.map((entry, index) => ({
        id: entry.section.id,
        sectionType: entry.section.sectionType,
        isPublished: entry.section.isPublished,
        title: entry.section.title,
        node: (
          <ClientSectionPreview
            section={entry.section}
            pageType={pageType}
            sectionIndex={index}
            data={entry.previewData}
          />
        ),
      }))}
      onSaveLayout={async (sectionId, layout) => {
        await adminJsonRequest(`/api/cms/page-sections/${sectionId}`, "PUT", { layout });
      }}
      onSaveTimelineStyle={async (sectionId, timelineStyle) => {
        const entry = sections.find((item) => item.section.id === sectionId);
        const payload = (entry?.section.payload as CustomTextSectionPayload | null) ?? { paragraphs: [] };
        await adminJsonRequest(`/api/cms/page-sections/${sectionId}`, "PUT", {
          payload: {
            ...payload,
            timelineStyle,
            timelineStyleScope: "section",
          },
        });
      }}
      shell={(children) =>
        pageType === "ABOUT" ? (
          <AboutPagePreviewShell>{children}</AboutPagePreviewShell>
        ) : (
          <ProgramPageShell pageType={pageType}>{children}</ProgramPageShell>
        )
      }
    />
  );
}

export type { SectionLayoutSettings };
