import { fetchAllPageSections } from "@/content/repositories/page-sections";
import { fetchSite } from "@/content/repositories/site";
import { fetchEventsForSection } from "@/content/repositories/events";
import { BrandingProvider } from "@/components/branding/BrandingProvider";
import { DesignSettingsProvider } from "@/components/design/DesignSettingsProvider";
import { ProgramPageDesignScope } from "@/components/design/ProgramPageDesignScope";
import { ProgramPagePreviewStudio } from "@/components/admin/ProgramPagePreviewStudio";
import { resolveTimelineStyleForSection } from "@/lib/custom-text-payload";
import { parseDesignSettings, resolvePageDesignSettings } from "@/lib/design-settings";
import {
  PAGE_TYPES,
  type CustomTextSectionPayload,
  type EventsSectionPayload,
  type GallerySectionPayload,
  type PageType,
  type TestimonialsSectionPayload,
} from "@/lib/page-section-types";
import {
  resolveSectionGalleryImages,
  resolveSectionTestimonials,
} from "@/lib/program-section-resolvers";
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

  const [sections, site] = await Promise.all([fetchAllPageSections(rawPageType), fetchSite()]);

  const enrichedSections = await Promise.all(
    sections.map(async (section) => {
      const payload = section.payload as CustomTextSectionPayload | null;
      const variant = payload?.variant;
      const timelineStyle = resolveTimelineStyleForSection(rawPageType, payload, site);
      const previewData: Record<string, unknown> = { timelineStyle };

      if (section.sectionType === "GALLERY") {
        previewData.galleryImages = await resolveSectionGalleryImages(
          (section.payload as GallerySectionPayload | null) ?? { images: [] },
          rawPageType,
        );
      }

      if (section.sectionType === "TESTIMONIALS") {
        previewData.testimonials = await resolveSectionTestimonials(
          (section.payload as TestimonialsSectionPayload | null) ?? { items: [] },
        );
      }

      if (section.sectionType === "EVENTS") {
        previewData.events = await fetchEventsForSection(
          (section.payload as EventsSectionPayload | null) ?? { eventKind: "all" },
        );
      }

      if (section.sectionType === "CONTACT") {
        previewData.contact = site.contact;
        previewData.social = site.social;
      }

      return {
        section,
        isTimelineSection: section.sectionType === "CUSTOM_TEXT" && isTimelineVariant(variant),
        timelineStyle,
        layoutContext: {
          pageType: rawPageType,
          customTextVariant: variant,
          hasImage: Boolean(section.imageUrl),
        },
        previewData,
      };
    }),
  );

  return (
    <BrandingProvider branding={site.branding}>
      <DesignSettingsProvider settings={parseDesignSettings(site.designSettings ?? null)}>
        <ProgramPageDesignScope settings={resolvePageDesignSettings(site, rawPageType)}>
          <ProgramPagePreviewStudio
            pageType={rawPageType}
            sections={enrichedSections}
            publicPath={PUBLIC_PATH[rawPageType]}
          />
        </ProgramPageDesignScope>
      </DesignSettingsProvider>
    </BrandingProvider>
  );
}
