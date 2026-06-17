import type { PageSectionType } from "@/lib/page-section-types";

export type PreviewLayoutControlGroup =
  | "spacing"
  | "contentWidth"
  | "textWidth"
  | "image"
  | "cards"
  | "gallery"
  | "style"
  | "animation";

const SECTION_CONTROL_GROUPS: Record<PageSectionType, PreviewLayoutControlGroup[]> = {
  HERO: ["spacing", "contentWidth", "textWidth", "image", "style", "animation"],
  IMAGE_TEXT: ["spacing", "contentWidth", "textWidth", "image", "style", "animation"],
  TESTIMONIALS: ["spacing", "contentWidth", "cards", "style", "animation"],
  EVENTS: ["spacing", "contentWidth", "cards", "style", "animation"],
  GALLERY: ["spacing", "contentWidth", "gallery", "style", "animation"],
  CONTACT: ["spacing", "contentWidth", "textWidth", "style", "animation"],
  CUSTOM_TEXT: ["spacing", "contentWidth", "textWidth", "style", "animation"],
};

export function previewControlsForSection(sectionType: PageSectionType) {
  return new Set(SECTION_CONTROL_GROUPS[sectionType] ?? ["spacing", "contentWidth", "textWidth", "style", "animation"]);
}
