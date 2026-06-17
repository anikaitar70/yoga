/** Prisma-aligned enums for program pages (Yoga, Healing, Just Art Affaire). */

import type { SectionLayoutSettings } from "@/lib/section-layout";
import type { TimelineStyleScope, TimelineStyleSettings } from "@/lib/timeline-style";

export const PAGE_TYPES = ["YOGA", "HEALING", "JUST_ART_LIFE", "ABOUT"] as const;
export type PageType = (typeof PAGE_TYPES)[number];

export const PAGE_SECTION_TYPES = [
  "HERO",
  "IMAGE_TEXT",
  "GALLERY",
  "TESTIMONIALS",
  "EVENTS",
  "CONTACT",
  "CUSTOM_TEXT",
] as const;
export type PageSectionType = (typeof PAGE_SECTION_TYPES)[number];

export const PAGE_TYPE_LABELS: Record<PageType, string> = {
  YOGA: "Yoga",
  HEALING: "Healing",
  JUST_ART_LIFE: "Just Art Affaire",
  ABOUT: "About",
};

export const PAGE_SECTION_TYPE_LABELS: Record<PageSectionType, string> = {
  HERO: "Hero / introduction",
  IMAGE_TEXT: "Image + text",
  GALLERY: "Photo gallery",
  TESTIMONIALS: "Testimonials",
  EVENTS: "Upcoming events",
  CONTACT: "Contact / inquiry",
  CUSTOM_TEXT: "Custom text block",
};

export type GalleryImageItem = {
  url: string;
  alt: string;
  title?: string;
};

export type GalleryFallbackMode = "inherit" | "none" | "category" | "collection";

export type GalleryFallbackConfig = {
  mode?: GalleryFallbackMode;
  category?: string;
  collectionSlug?: string;
};

export type GallerySectionPayload = {
  images: GalleryImageItem[];
  carousel?: boolean;
  fallback?: GalleryFallbackConfig;
};

export type HeroSectionPayload = {
  tagline?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  showSecondaryCta?: boolean;
};

export type SectionTestimonialItem = {
  quote?: string;
  name?: string;
  role?: string;
  imageUrl?: string;
  imageAlt?: string;
};

export type TestimonialsSectionPayload = {
  items: SectionTestimonialItem[];
};

export type EventsSectionPayload = {
  /** Prisma EventCategory values */
  categories?: string[];
  /** sessions = exclude retreats; retreats = RETREATS_AND_TOURS only */
  eventKind?: "all" | "sessions" | "retreats";
  limit?: number;
};

export type ContactSectionPayload = {
  showForm?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
  formSubject?: string;
};

export type YogaJourneySutraPayload = {
  sanskrit: string;
  transliteration: string;
  translation: string;
  source: string;
  interpretation?: string;
};

export type JourneyHighlightPayload = {
  afterIndex: number;
  label?: string;
  text: string;
  enabled?: boolean;
};

export type TimelineItemPayload = {
  number: string;
  text: string;
  title?: string;
};

export type CustomTextSectionPayload = {
  paragraphs: string[];
  variant?:
    | "default"
    | "yoga-journey"
    | "healing-journey"
    | "art-journey"
    | "experience-timeline"
    | "philosophy";
  introParagraphCount?: number;
  closingParagraphCount?: number;
  /** Yoga journey — Patanjali sutra callout block */
  sutra?: YogaJourneySutraPayload & { enabled?: boolean };
  sutraEnabled?: boolean;
  /** Healing / art journey — highlighted quote boxes */
  highlights?: JourneyHighlightPayload[];
  highlightsEnabled?: boolean;
  /** Philosophy — multiple sutra callout blocks (About page) */
  sutras?: (YogaJourneySutraPayload & { interpretation?: string })[];
  /** Art journey / About experience timeline — numbered timeline rows */
  timeline?: {
    enabled?: boolean;
    /** linked = text from paragraphs; manual = timeline.items text */
    mode?: "linked" | "manual";
    items?: TimelineItemPayload[];
    /** @deprecated Numbers are derived from render order — kept for legacy payloads only. */
    numbers?: string[];
  };
  /** Timeline typography and colors — merges with page/site defaults. */
  timelineStyle?: TimelineStyleSettings;
  /** Where timeline style changes apply when saved from CMS. */
  timelineStyleScope?: TimelineStyleScope;
};

export type PageSectionPayload =
  | HeroSectionPayload
  | GallerySectionPayload
  | TestimonialsSectionPayload
  | EventsSectionPayload
  | ContactSectionPayload
  | CustomTextSectionPayload
  | Record<string, never>;

export type PageSectionRecord = {
  id: string;
  pageType: PageType;
  sectionType: PageSectionType;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  sortOrder: number;
  isPublished: boolean;
  layout: SectionLayoutSettings | null;
  payload: PageSectionPayload | null;
};

export function contentToParagraphs(content: string | null | undefined): string[] {
  if (!content?.trim()) return [];
  return content
    .split(/\n{2,}|\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function paragraphsToContent(paragraphs: string[]): string {
  return paragraphs.filter(Boolean).join("\n\n");
}
