import { SectionBackground } from "@/components/content/SectionBackground";
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
import { DynamicImageTextSectionBlock } from "@/components/content/sections/DynamicImageTextSection";
import { ButtonSectionBlock } from "@/components/content/sections/ButtonSection";

type PageSectionRendererProps = {
  section: PageSectionRecord;
  pageType: PageType;
  sectionIndex?: number;
};

export async function PageSectionRenderer({ section, pageType, sectionIndex = 0 }: PageSectionRendererProps) {
  const props = { section, pageType, sectionIndex };

  let block;
  switch (section.sectionType) {
    case "HERO":
      block = <HeroSectionBlock {...props} />;
      break;
    case "IMAGE_TEXT":
    case "DYNAMIC_IMAGE_TEXT":
      block = <DynamicImageTextSectionBlock {...props} />;
      break;
    case "GALLERY":
      block = <GallerySectionBlock {...props} />;
      break;
    case "TESTIMONIALS":
      block = <TestimonialsSectionBlock {...props} />;
      break;
    case "EVENTS":
      block = <EventsSectionBlock {...props} />;
      break;
    case "CONTACT":
      block = <ContactSectionBlock {...props} />;
      break;
    case "CUSTOM_TEXT":
      block = <CustomTextSectionBlock {...props} />;
      break;
    case "BUTTON":
      block = <ButtonSectionBlock {...props} />;
      break;
    default:
      block = null;
  }

  return (
    <SectionBackground settings={section.layout?.sectionBackground}>
      {block}
    </SectionBackground>
  );
}
