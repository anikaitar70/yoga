import type { PageSectionRecord } from "@/lib/page-section-types";
import type { PageType } from "@/lib/page-section-types";
import {
  ContactSectionBlock,
  CustomTextSectionBlock,
  EventsSectionBlock,
  GallerySectionBlock,
  HeroSectionBlock,
  ImageTextSectionBlock,
  TestimonialsSectionBlock,
} from "@/components/content/sections/PageSectionBlocks";

type PageSectionRendererProps = {
  section: PageSectionRecord;
  pageType: PageType;
  sectionIndex?: number;
};

export async function PageSectionRenderer({ section, pageType, sectionIndex = 0 }: PageSectionRendererProps) {
  const props = { section, pageType, sectionIndex };

  switch (section.sectionType) {
    case "HERO":
      return <HeroSectionBlock {...props} />;
    case "IMAGE_TEXT":
      return <ImageTextSectionBlock {...props} />;
    case "GALLERY":
      return <GallerySectionBlock {...props} />;
    case "TESTIMONIALS":
      return <TestimonialsSectionBlock {...props} />;
    case "EVENTS":
      return <EventsSectionBlock {...props} />;
    case "CONTACT":
      return <ContactSectionBlock {...props} />;
    case "CUSTOM_TEXT":
      return <CustomTextSectionBlock {...props} />;
    default:
      return null;
  }
}
