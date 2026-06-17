"use client";

import type { ReactNode } from "react";
import {
  buildHomepageLayoutPayload,
  HOMEPAGE_SECTION_DEFINITIONS,
  PATHWAY_SECTION_IDS,
  resolveHomepageSectionLayouts,
  type HomepageLayoutSettings,
  type HomepageSectionId,
} from "@/lib/homepage-layout";
import { DEFAULT_HOMEPAGE_SPACING } from "@/lib/homepage-spacing";
import type { HomepageSectionsContent } from "@/lib/homepage-sections";
import { SectionPreviewStudio } from "@/components/admin/SectionPreviewStudio";
import { adminJsonRequest } from "@/lib/admin-fetch";
import type { SectionLayoutSettings } from "@/lib/section-layout";

type HomepagePreviewStudioProps = {
  homepageLayout: HomepageLayoutSettings | null | undefined;
  homepageSections: HomepageSectionsContent;
  sectionElements: {
    id: HomepageSectionId;
    node: ReactNode;
    visible?: boolean;
  }[];
};

export function HomepagePreviewStudio({
  homepageLayout,
  homepageSections,
  sectionElements,
}: HomepagePreviewStudioProps) {
  const sectionLayouts = resolveHomepageSectionLayouts(homepageLayout);
  const spacing = homepageLayout ?? DEFAULT_HOMEPAGE_SPACING;

  const visibleElements = sectionElements.filter((entry) => entry.visible !== false);

  const sections = HOMEPAGE_SECTION_DEFINITIONS.filter((definition) =>
    visibleElements.some((entry) => entry.id === definition.id),
  ).map((definition) => ({
    id: definition.id,
    sectionType: definition.sectionType,
    title: definition.title,
    isPublished: true,
    layout: sectionLayouts[definition.id],
  }));

  return (
    <SectionPreviewStudio
      pageTitle="Homepage"
      pageDescription="Tune homepage section layout with the same controls as program pages. Changes stay local until you click Save layout."
      backHref="/admin/content"
      backLabel="Back to content"
      publicPath="/"
      sections={sections}
      sectionElements={visibleElements.map((entry) => {
        const definition = HOMEPAGE_SECTION_DEFINITIONS.find((item) => item.id === entry.id);
        return {
          id: entry.id,
          sectionType: definition?.sectionType ?? "CUSTOM_TEXT",
          isPublished: true,
          title: definition?.title ?? entry.id,
          node: entry.node,
        };
      })}
      onSaveLayout={async (sectionId, layout) => {
        const nextLayouts = {
          ...sectionLayouts,
          [sectionId]: layout,
        };
        const payload: Record<string, unknown> = {
          homepageLayout: buildHomepageLayoutPayload(nextLayouts, spacing),
        };

        if (layout.imageSide) {
          if (sectionId === "about-preview") {
            payload.homepageSections = {
              ...homepageSections,
              aboutPreview: {
                ...homepageSections.aboutPreview,
                imageSide: layout.imageSide,
              },
            };
          }

          const pathwayIndex = PATHWAY_SECTION_IDS.indexOf(sectionId as (typeof PATHWAY_SECTION_IDS)[number]);
          if (pathwayIndex >= 0) {
            payload.homepageSections = {
              ...(payload.homepageSections as HomepageSectionsContent | undefined) ?? homepageSections,
              pathways: homepageSections.pathways.map((pathway, index) =>
                index === pathwayIndex ? { ...pathway, imageSide: layout.imageSide } : pathway,
              ),
            };
          }
        }

        await adminJsonRequest("/api/cms/site", "PUT", payload);
      }}
      shell={(children) => (
        <div className="min-h-full bg-background">{children}</div>
      )}
      emptyMessage="No homepage sections to preview."
    />
  );
}

export type { SectionLayoutSettings };
