import { z } from "zod";

export const TESTIMONIALS_LAYOUT_OPTIONS = ["grid", "list"] as const;
export type TestimonialsLayout = (typeof TESTIMONIALS_LAYOUT_OPTIONS)[number];

export const TESTIMONIALS_GAP_OPTIONS = ["compact", "normal", "relaxed", "custom"] as const;
export type TestimonialsGap = (typeof TESTIMONIALS_GAP_OPTIONS)[number];

export const TESTIMONIALS_SECTION_SPACING_OPTIONS = ["none", "default", "loose", "pageHero"] as const;
export type TestimonialsSectionSpacing = (typeof TESTIMONIALS_SECTION_SPACING_OPTIONS)[number];

export const TESTIMONIALS_CONTENT_WIDTH_OPTIONS = ["narrow", "normal", "wide"] as const;
export type TestimonialsContentWidth = (typeof TESTIMONIALS_CONTENT_WIDTH_OPTIONS)[number];

export type TestimonialsPageSettings = {
  layout: TestimonialsLayout;
  cardGap: TestimonialsGap;
  cardGapCustom?: string;
  sectionSpacing: TestimonialsSectionSpacing;
  contentWidth: TestimonialsContentWidth;
  headerTitle?: string;
  headerSubtitle?: string;
  headerTitleJa?: string;
  headerSubtitleJa?: string;
};

export const DEFAULT_TESTIMONIALS_PAGE_SETTINGS: TestimonialsPageSettings = {
  layout: "grid",
  cardGap: "normal",
  sectionSpacing: "default",
  contentWidth: "normal",
};

export const testimonialsPageSettingsSchema = z.object({
  layout: z.enum(TESTIMONIALS_LAYOUT_OPTIONS).optional().default("grid"),
  cardGap: z.enum(TESTIMONIALS_GAP_OPTIONS).optional().default("normal"),
  cardGapCustom: z.string().regex(/^\d{1,3}px$/, "e.g. 24px").optional(),
  sectionSpacing: z.enum(TESTIMONIALS_SECTION_SPACING_OPTIONS).optional().default("default"),
  contentWidth: z.enum(TESTIMONIALS_CONTENT_WIDTH_OPTIONS).optional().default("normal"),
  headerTitle: z.string().optional(),
  headerSubtitle: z.string().optional(),
  headerTitleJa: z.string().optional(),
  headerSubtitleJa: z.string().optional(),
});

export function parseTestimonialsPageSettings(raw: unknown): TestimonialsPageSettings {
  const parsed = testimonialsPageSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { ...DEFAULT_TESTIMONIALS_PAGE_SETTINGS };
  }
  return {
    layout: parsed.data.layout ?? "grid",
    cardGap: parsed.data.cardGap ?? "normal",
    cardGapCustom: parsed.data.cardGapCustom,
    sectionSpacing: parsed.data.sectionSpacing ?? "default",
    contentWidth: parsed.data.contentWidth ?? "normal",
    headerTitle: parsed.data.headerTitle,
    headerSubtitle: parsed.data.headerSubtitle,
    headerTitleJa: parsed.data.headerTitleJa,
    headerSubtitleJa: parsed.data.headerSubtitleJa,
  };
}
