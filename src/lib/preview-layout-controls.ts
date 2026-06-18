import type { PageSectionType, PageType } from "@/lib/page-section-types";

export type PreviewLayoutControlGroup =
  | "spacing"
  | "contentWidth"
  | "textWidth"
  | "alignment"
  | "image"
  | "cards"
  | "gallery"
  | "style"
  | "animation";

export type PreviewLayoutContext = {
  pageType?: PageType;
  customTextVariant?: string;
  hasImage?: boolean;
};

const SECTION_CONTROL_GROUPS: Record<PageSectionType, PreviewLayoutControlGroup[]> = {
  HERO: ["spacing", "contentWidth", "textWidth", "alignment", "image", "style", "animation"],
  IMAGE_TEXT: ["spacing", "contentWidth", "textWidth", "alignment", "image", "style", "animation"],
  TESTIMONIALS: ["spacing", "contentWidth", "alignment", "cards", "style", "animation"],
  EVENTS: ["spacing", "contentWidth", "alignment", "cards", "style", "animation"],
  GALLERY: ["spacing", "contentWidth", "alignment", "gallery", "style", "animation"],
  CONTACT: ["spacing", "contentWidth", "textWidth", "alignment", "style", "animation"],
  CUSTOM_TEXT: ["spacing", "contentWidth", "textWidth", "alignment", "style", "animation"],
};

export function previewControlsForSection(
  sectionType: PageSectionType,
  context: PreviewLayoutContext = {},
) {
  const groups = new Set(
    SECTION_CONTROL_GROUPS[sectionType] ?? ["spacing", "contentWidth", "textWidth", "style", "animation"],
  );

  if (!context.hasImage && (sectionType === "HERO" || sectionType === "IMAGE_TEXT")) {
    groups.delete("image");
  }

  if (sectionType === "CUSTOM_TEXT" && context.pageType === "ABOUT") {
    if (context.customTextVariant === "philosophy") {
      groups.delete("textWidth");
    }
    if (context.customTextVariant === "experience-timeline") {
      groups.delete("textWidth");
    }
  }

  if (sectionType === "CONTACT") {
    groups.delete("textWidth");
  }

  return groups;
}
