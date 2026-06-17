"use client";



import type { PageSectionRecord, PageType } from "@/lib/page-section-types";

import { PAGE_TYPE_LABELS } from "@/lib/page-section-types";

import { ProgramPageShell } from "@/components/program/ProgramPageShell";

import { SectionPreviewStudio } from "@/components/admin/SectionPreviewStudio";

import { adminJsonRequest } from "@/lib/admin-fetch";

import type { SectionLayoutSettings } from "@/lib/section-layout";

import type { TimelineStyleSettings } from "@/lib/timeline-style";

import type { CustomTextSectionPayload } from "@/lib/page-section-types";



type ProgramPagePreviewStudioProps = {

  pageType: PageType;

  sections: Array<

    PageSectionRecord & {

      isTimelineSection?: boolean;

      timelineStyle?: TimelineStyleSettings | null;

    }

  >;

  sectionElements: {

    id: string;

    sectionType: PageSectionRecord["sectionType"];

    isPublished: boolean;

    title: string | null;

    node: React.ReactNode;

  }[];

  publicPath: string;

};



export function ProgramPagePreviewStudio({

  pageType,

  sections,

  sectionElements,

  publicPath,

}: ProgramPagePreviewStudioProps) {

  return (

    <SectionPreviewStudio

      pageTitle={PAGE_TYPE_LABELS[pageType]}

      backHref="/admin/pages"

      publicPath={publicPath}

      sections={sections.map((section) => ({

        id: section.id,

        sectionType: section.sectionType,

        isPublished: section.isPublished,

        title: section.title,

        layout: section.layout,

        isTimelineSection: section.isTimelineSection,

        timelineStyle: section.timelineStyle,

      }))}

      sectionElements={sectionElements}

      onSaveLayout={async (sectionId, layout) => {

        await adminJsonRequest(`/api/cms/page-sections/${sectionId}`, "PUT", { layout });

      }}

      onSaveTimelineStyle={async (sectionId, timelineStyle) => {

        const section = sections.find((item) => item.id === sectionId);

        const payload = (section?.payload as CustomTextSectionPayload | null) ?? { paragraphs: [] };

        await adminJsonRequest(`/api/cms/page-sections/${sectionId}`, "PUT", {

          payload: {

            ...payload,

            timelineStyle,

            timelineStyleScope: "section",

          },

        });

      }}

      shell={(children) => <ProgramPageShell pageType={pageType}>{children}</ProgramPageShell>}

    />

  );

}



export type { SectionLayoutSettings };


