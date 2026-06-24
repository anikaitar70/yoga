import { z } from "zod";
import { isCustomTextVariantAllowed } from "@/lib/custom-text-variants";
import { defaultHeroPayloadForPage } from "@/lib/hero-section-display";
import type { PageType } from "@/lib/page-section-types";
import { LOCAL_UPLOAD_PATH_REGEX } from "@/lib/upload-url";

const imageUrlField = z.union([
  z.string().url(),
  z.string().regex(LOCAL_UPLOAD_PATH_REGEX, "Invalid image URL"),
]);

/** Treat blank strings as missing so optional image fields do not fail validation. */
const optionalImageUrlField = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  imageUrlField.optional(),
);

export type TestimonialItemInput = {
  quote?: string;
  name?: string;
  role?: string;
  imageUrl?: string;
  imageAlt?: string;
};

function testimonialItemHasContent(item: TestimonialItemInput): boolean {
  return Boolean(
    item.quote?.trim() || item.imageUrl?.trim() || item.name?.trim() || item.role?.trim(),
  );
}

export function sanitizeTestimonialItem(item: TestimonialItemInput): TestimonialItemInput {
  const quote = item.quote?.trim();
  const name = item.name?.trim();
  const role = item.role?.trim();
  const imageUrl = item.imageUrl?.trim();
  const imageAlt = item.imageAlt?.trim();

  return {
    ...(quote ? { quote } : {}),
    ...(name ? { name } : {}),
    ...(role ? { role } : {}),
    ...(imageUrl ? { imageUrl } : {}),
    ...(imageAlt ? { imageAlt } : {}),
  };
}

export function sanitizeTestimonialsPayload(
  payload: { items?: TestimonialItemInput[] } | null | undefined,
): { items: TestimonialItemInput[] } {
  const items = (payload?.items ?? [])
    .map(sanitizeTestimonialItem)
    .filter(testimonialItemHasContent);
  return { items };
}

const galleryImageSchema = z.object({
  url: imageUrlField,
  alt: z.string().min(1),
  title: z.string().optional(),
});

function sanitizeGalleryPayloadImages(payload: unknown): unknown {
  if (typeof payload !== "object" || payload === null) {
    return payload;
  }

  const record = payload as { images?: unknown };
  if (!Array.isArray(record.images)) {
    return payload;
  }

  const images = record.images.filter((item) => {
    if (typeof item !== "object" || item === null) {
      return false;
    }
    const image = item as { url?: unknown; alt?: unknown };
    const url = typeof image.url === "string" ? image.url.trim() : "";
    const alt = typeof image.alt === "string" ? image.alt.trim() : "";
    return Boolean(url && alt);
  });

  return { ...record, images };
}

const galleryFallbackSchema = z.object({
  mode: z.enum(["inherit", "none", "category", "collection"]).optional(),
  category: z.string().optional(),
  collectionSlug: z.string().optional(),
});

export const galleryPayloadSchema = z.object({
  images: z.array(galleryImageSchema).default([]),
  carousel: z.boolean().optional(),
  fallback: galleryFallbackSchema.optional(),
});

export const heroPayloadSchema = z.object({
  tagline: z.string().optional(),
  primaryCta: z
    .object({
      label: z.string().min(1),
      href: z.string().min(1),
    })
    .optional(),
  secondaryCta: z
    .object({
      label: z.string().min(1),
      href: z.string().min(1),
    })
    .optional(),
  showSecondaryCta: z.boolean().optional(),
});

export const testimonialItemSchema = z.object({
  quote: z.string().optional(),
  name: z.string().optional(),
  role: z.string().optional(),
  imageUrl: optionalImageUrlField,
  imageAlt: z.string().optional(),
});

export const testimonialsPayloadSchema = z.object({
  items: z.array(testimonialItemSchema).default([]),
});

export const eventsPayloadSchema = z.object({
  categories: z.array(z.string()).optional(),
  eventKind: z.enum(["all", "sessions", "retreats"]).optional(),
  limit: z.number().int().positive().max(24).optional(),
});

export const contactPayloadSchema = z.object({
  showForm: z.boolean().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  formSubject: z.string().optional(),
});

const yogaJourneySutraSchema = z.object({
  sanskrit: z.string().optional(),
  transliteration: z.string().optional(),
  translation: z.string().optional(),
  source: z.string().optional(),
  interpretation: z.string().optional(),
  enabled: z.boolean().optional(),
});

const journeyHighlightSchema = z.object({
  afterIndex: z.number().int().min(0),
  label: z.string().optional(),
  text: z.string().min(1),
  enabled: z.boolean().optional(),
});

const timelineItemSchema = z.object({
  number: z.string().optional(),
  text: z.string().min(1),
  title: z.string().optional(),
});

const timelineStyleSchema = z.object({
  numberColor: z.string().optional(),
  titleColor: z.string().optional(),
  textColor: z.string().optional(),
  numberFont: z.string().optional(),
  titleFont: z.string().optional(),
  textFont: z.string().optional(),
  lineColor: z.string().optional(),
  dotColor: z.string().optional(),
  numberWeight: z.string().optional(),
  titleWeight: z.string().optional(),
  textWeight: z.string().optional(),
  numberSize: z.string().optional(),
  titleSize: z.string().optional(),
  textSize: z.string().optional(),
});

const philosophySutraSchema = yogaJourneySutraSchema.extend({
  interpretation: z.string().optional(),
});

export const customTextPayloadSchema = z.object({
  paragraphs: z.array(z.string().min(1)).default([]),
  variant: z
    .enum([
      "default",
      "yoga-journey",
      "healing-journey",
      "art-journey",
      "experience-timeline",
      "philosophy",
    ])
    .optional(),
  introParagraphCount: z.number().int().min(0).optional(),
  closingParagraphCount: z.number().int().min(0).optional(),
  sutra: yogaJourneySutraSchema
    .extend({ enabled: z.boolean().optional() })
    .optional(),
  sutraEnabled: z.boolean().optional(),
  highlights: z.array(journeyHighlightSchema).optional(),
  highlightsEnabled: z.boolean().optional(),
  sutras: z.array(philosophySutraSchema).optional(),
  timeline: z
    .object({
      enabled: z.boolean().optional(),
      mode: z.enum(["linked", "manual"]).optional(),
      items: z.array(timelineItemSchema).optional(),
      numbers: z.array(z.string()).optional(),
    })
    .optional(),
  timelineStyle: timelineStyleSchema.optional(),
  timelineStyleScope: z.enum(["section", "page", "site"]).optional(),
});

export function parseCustomTextPayload(
  payload: unknown,
  pageType?: PageType,
): Record<string, unknown> {
  const parsed = customTextPayloadSchema.parse(payload);
  if (pageType && !isCustomTextVariantAllowed(pageType, parsed.variant)) {
    throw new z.ZodError([
      {
        code: "custom",
        message: `Variant "${parsed.variant ?? "default"}" is not allowed on ${pageType} pages.`,
        path: ["variant"],
      },
    ]);
  }
  return parsed;
}

export function parseSectionPayload(
  sectionType: string,
  payload: unknown,
  pageType?: PageType,
): Record<string, unknown> | null {
  if (payload == null) return null;
  switch (sectionType) {
    case "HERO":
      return heroPayloadSchema.parse(payload);
    case "GALLERY":
      return galleryPayloadSchema.parse(sanitizeGalleryPayloadImages(payload));
    case "TESTIMONIALS":
      return testimonialsPayloadSchema.parse(
        sanitizeTestimonialsPayload(
          typeof payload === "object" && payload !== null
            ? (payload as { items?: TestimonialItemInput[] })
            : undefined,
        ),
      );
    case "EVENTS":
      return eventsPayloadSchema.parse(payload);
    case "CONTACT":
      return contactPayloadSchema.parse(payload);
    case "CUSTOM_TEXT":
      return parseCustomTextPayload(payload, pageType);
    default:
      return typeof payload === "object" && payload !== null ? (payload as Record<string, unknown>) : null;
  }
}

export function defaultPayloadForSectionType(
  sectionType: string,
  pageType?: PageType,
): Record<string, unknown> | null {
  switch (sectionType) {
    case "HERO":
      return pageType ? defaultHeroPayloadForPage(pageType) : {};
    case "GALLERY":
      return { images: [], carousel: false, fallback: { mode: "inherit" } };
    case "TESTIMONIALS":
      return { items: [] };
    case "EVENTS":
      return { eventKind: "all", limit: 6 };
    case "CONTACT":
      return { showForm: true, ctaLabel: "Get in touch", ctaHref: "/contact" };
    case "CUSTOM_TEXT":
      return { paragraphs: [] };
    default:
      return null;
  }
}
