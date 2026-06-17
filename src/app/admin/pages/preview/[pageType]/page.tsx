import { fetchAllPageSections } from "@/content/repositories/page-sections";
import { fetchSite } from "@/content/repositories/site";
import { ProgramPagePreviewStudio } from "@/components/admin/ProgramPagePreviewStudio";
import { PageSectionRenderer } from "@/components/content/sections/PageSectionRenderer";
import { resolveTimelineStyleForSection } from "@/lib/custom-text-payload";
import { PAGE_TYPES, type CustomTextSectionPayload, type PageType } from "@/lib/page-section-types";
import { isTimelineVariant } from "@/lib/timeline-style";

const PUBLIC_PATH: Record<PageType, string> = {
  YOGA: "/yoga",
  HEALING: "/healing",
  JUST_ART_LIFE: "/just-art-life",
  ABOUT: "/about",
};

function isPageType(value: string): value is PageType {
  return (PAGE_TYPES as readonly string[]).includes(value);
}

export default async function AdminProgramPagePreview({
  params,
}: {
  params: Promise<{ pageType: string }>;
}) {
  const { pageType: rawPageType } = await params;

  if (!isPageType(rawPageType)) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Unknown page type.
      </div>
    );
  }

  const sections = await fetchAllPageSections(rawPageType);
  const site = await fetchSite();

  const enrichedSections = sections.map((section) => {
    const payload = section.payload as CustomTextSectionPayload | null;
    const variant = payload?.variant;
    return {
      ...section,
      isTimelineSection: section.sectionType === "CUSTOM_TEXT" && isTimelineVariant(variant),
      timelineStyle: resolveTimelineStyleForSection(rawPageType, payload, site),
    };
  });

  const sectionElements = enrichedSections.map((section, index) => ({
    id: section.id,
    sectionType: section.sectionType,
    isPublished: section.isPublished,
    title: section.title,
    node: <PageSectionRenderer section={section} pageType={rawPageType} sectionIndex={index} />,
  }));

  return (
    <div className="-mx-4 sm:-mx-6">
      <ProgramPagePreviewStudio
        pageType={rawPageType}
        sections={enrichedSections}
        sectionElements={sectionElements}
        publicPath={PUBLIC_PATH[rawPageType]}
      />
    </div>
  );
}
