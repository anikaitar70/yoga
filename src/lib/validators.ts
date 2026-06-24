import { z } from "zod";
import { EVENT_CATEGORY_VALUES } from "@/lib/event-categories";
import { PAGE_SECTION_TYPES, PAGE_TYPES } from "@/lib/page-section-types";
import {
  contactPayloadSchema,
  customTextPayloadSchema,
  eventsPayloadSchema,
  galleryPayloadSchema,
  testimonialsPayloadSchema,
} from "@/lib/page-section-payloads";
import { sectionLayoutSchema } from "@/lib/section-layout";
import { designSettingsSchema, parseDesignSettings } from "@/lib/design-settings";
import { blogSectionsSchema, blogHasRenderableBody } from "@/lib/blog-sections";
import { LOCAL_UPLOAD_PATH_REGEX } from "@/lib/upload-url";

const designSettingsOverrideSchema = z
  .object({
    typography: z
      .object({
        headings: z.record(z.string(), z.unknown()).optional(),
        body: z.record(z.string(), z.unknown()).optional(),
        navigation: z.record(z.string(), z.unknown()).optional(),
        buttons: z.record(z.string(), z.unknown()).optional(),
      })
      .optional(),
    headerLayout: z.record(z.string(), z.unknown()).optional(),
    heroLayout: z.record(z.string(), z.unknown()).optional(),
    colors: z.record(z.string(), z.unknown()).optional(),
    navigationStyling: z.record(z.string(), z.unknown()).optional(),
  })
  .optional();

const designSettingsInputSchema = z.preprocess(
  (value) => (value === undefined ? undefined : parseDesignSettings(value)),
  designSettingsSchema.optional(),
);

const dateTimeString = z
  .string()
  .datetime({ offset: true })
  .or(z.string().regex(/^[0-9TZ:.+-]+$/, "Invalid ISO date string"));

const localImageUrl = z.string().regex(LOCAL_UPLOAD_PATH_REGEX, "Invalid image URL");

/** Accepts hosted URLs or locally uploaded paths under /uploads/… */
export const imageUrlSchema = z.union([z.string().url(), localImageUrl]);

const optionalImageUrl = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? undefined : value),
  imageUrlSchema.optional(),
);

/** Blank CMS input becomes null so nullable image columns can be cleared on save. */
export const nullableImageUrlSchema = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? null : value),
  z.union([imageUrlSchema, z.null()]),
);

/** Blank CMS input stays as "" for required string columns (e.g. hero imageSrc). */
export const clearableImageUrlSchema = z.preprocess(
  (value) => (value === null || value === undefined ? "" : value),
  z.union([imageUrlSchema, z.literal("")]),
);

const eventCategory = z.enum(EVENT_CATEGORY_VALUES).default("YOGA");

const testimonialStatus = z.preprocess(
  (value) => (typeof value === "string" ? value.toUpperCase() : value),
  z.enum(["PENDING", "APPROVED", "REJECTED"]),
);

export const eventCreateSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  location: z.string().min(1),
  startsAt: dateTimeString,
  endsAt: dateTimeString.nullable().optional(),
  imageUrl: nullableImageUrlSchema.optional(),
  price: z.number().nonnegative().optional(),
  category: eventCategory.optional(),
  isFeatured: z.boolean().optional(),
  published: z.boolean().optional(),
});

export const eventUpdateSchema = eventCreateSchema.partial();

const testimonialSourceType = z.preprocess(
  (value) => {
    if (typeof value === "string") return value.toUpperCase();
    if (value === null) return undefined;
    return value;
  },
  z.enum(["TEXT", "IMAGE", "OCR"]).optional(),
);
const testimonialDisplayStyle = z.preprocess(
  (value) => {
    if (typeof value === "string") return value.toUpperCase();
    if (value === null) return undefined;
    return value;
  },
  z.enum(["CARD", "HANDWRITTEN"]).optional(),
);

const testimonialFieldsSchema = z.object({
  quote: z.string().optional(),
  name: z.string().optional(),
  role: z.string().optional(),
  city: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  imageUrl: nullableImageUrlSchema.optional(),
  imageAlt: z.string().nullable().optional(),
  extractedText: z.string().nullable().optional(),
  sourceType: testimonialSourceType,
  displayStyle: testimonialDisplayStyle,
  ocrConfidence: z.number().min(0).max(100).nullable().optional(),
  featured: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  status: testimonialStatus.optional(),
});

export const testimonialCreateSchema = testimonialFieldsSchema.refine(
  (data) => Boolean(data.quote?.trim()) || Boolean(data.imageUrl?.trim()),
  { message: "Provide a quote or an image." },
);

/** Partial updates — refinement only on create (Zod 4 disallows .partial() on refined schemas). */
export const testimonialUpdateSchema = testimonialFieldsSchema.partial();


const blogFieldsSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  summary: z.string().min(1),
  content: z.string().default(""),
  sections: blogSectionsSchema.optional(),
  coverImageUrl: optionalImageUrl,
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  publishedAt: dateTimeString.optional(),
});

export const blogCreateSchema = blogFieldsSchema.refine(
  (data) => blogHasRenderableBody(data.content, data.sections ?? []),
  {
    message: "Add article content or at least one content section.",
    path: ["content"],
  },
);

/** Partial updates — refinement only when content/sections are included (Zod 4 disallows .partial() on refined schemas). */
export const blogUpdateSchema = blogFieldsSchema.partial().superRefine((data, ctx) => {
  if (data.content === undefined && data.sections === undefined) {
    return;
  }
  if (!blogHasRenderableBody(data.content ?? "", data.sections ?? [])) {
    ctx.addIssue({
      code: "custom",
      message: "Add article content or at least one content section.",
      path: ["content"],
    });
  }
});

export const userCreateSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).optional(),
  avatarUrl: z.string().url().optional(),
});

export const newsletterCreateSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).optional(),
});

export const preferredContactMethod = z.enum([
  "WHATSAPP",
  "CALL",
  "SMS",
  "EMAIL",
  "LINE",
  "TELEGRAM",
  "OTHER",
]);

export const contactCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(6).optional(),
  subject: z.string().min(1),
  message: z.string().min(10),
  preferredContactMethod: preferredContactMethod.optional(),
  subscribeToNewsletter: z.boolean().optional(),
});

/**
 * Accept raw section payload JSON here; `parseSectionPayload(sectionType, …)` validates
 * per section type. Do not use a z.union of payload schemas — gallery defaults match
 * any object and strip testimonial `items`.
 */
export const pageSectionPayloadSchema = z.record(z.string(), z.unknown());

const optionalText = z.string().nullish();

export const pageSectionCreateSchema = z.object({
  pageType: z.enum(PAGE_TYPES),
  sectionType: z.enum(PAGE_SECTION_TYPES),
  title: optionalText,
  subtitle: optionalText,
  content: optionalText,
  imageUrl: nullableImageUrlSchema.optional(),
  imageAlt: optionalText,
  sortOrder: z.number().int().nonnegative().optional(),
  isPublished: z.boolean().optional(),
  layout: sectionLayoutSchema.nullish(),
  payload: pageSectionPayloadSchema.optional().nullable(),
});

export const pageSectionUpdateSchema = pageSectionCreateSchema
  .omit({ pageType: true, sectionType: true })
  .partial()
  .extend({
    sectionType: z.enum(PAGE_SECTION_TYPES).optional(),
  });

export const pageSectionReorderSchema = z.object({
  pageType: z.enum(PAGE_TYPES),
  orderedIds: z.array(z.string().min(1)).min(1),
});

const galleryVariantFields = {
  thumbnailUrl: imageUrlSchema.optional(),
  mediumUrl: imageUrlSchema.optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
};

export const galleryCreateSchema = z.object({
  title: z.string().min(1).optional(),
  url: imageUrlSchema,
  uploadPath: z.string().optional(),
  ...galleryVariantFields,
  altText: z.string().min(1).optional(),
  description: z.string().optional(),
  aspectClass: z.string().optional(),
  category: z
    .enum(["ART", "YOGA_NIDRA", "EVENTS", "RETREATS", "HEALING", "JAPAN_EVENTS"])
    .optional(),
  collectionId: z.string().uuid().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
  featuredOnHomepage: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

export const galleryBatchCreateSchema = z.object({
  collectionId: z.string().uuid(),
  category: z.enum(["ART", "YOGA_NIDRA", "EVENTS", "RETREATS", "HEALING", "JAPAN_EVENTS"]),
  items: z
    .array(
      z.object({
        url: imageUrlSchema,
        uploadPath: z.string().optional(),
        ...galleryVariantFields,
        title: z.string().optional(),
        altText: z.string().optional(),
        description: z.string().optional(),
        sortOrder: z.number().int().nonnegative().optional(),
        featuredOnHomepage: z.boolean().optional(),
      }),
    )
    .min(1)
    .max(50),
});

export const galleryReorderSchema = z.object({
  collectionId: z.string().uuid(),
  orderedIds: z.array(z.string().uuid()).min(1),
});

export const collageCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  layout: z.enum([
    "MASONRY",
    "STACKED",
    "ASYMMETRICAL_GRID",
    "HERO_SUPPORTING",
    "HORIZONTAL_STRIP",
    "FEATURED_SUPPORTING",
  ]),
  category: z.enum(["ART", "YOGA_NIDRA", "EVENTS", "RETREATS", "HEALING", "JAPAN_EVENTS"]),
  collectionId: z.string().uuid().optional(),
  imageIds: z.array(z.string().uuid()).min(1).max(12),
  isPublished: z.boolean().optional(),
});

export const collageUpdateSchema = collageCreateSchema.partial();

export const heroUpdateSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  primaryCtaLabel: z.string().min(1),
  primaryCtaHref: z.string().min(1),
  secondaryCtaLabel: z.string().min(1),
  secondaryCtaHref: z.string().min(1),
  imageSrc: clearableImageUrlSchema,
  imageAlt: z.string().min(1),
  mediaMode: z.enum(["SINGLE", "ROTATING", "COLLAGE", "FEATURED_COLLECTION"]).optional(),
  rotatingImages: z
    .array(
      z.object({
        url: imageUrlSchema,
        alt: z.string().min(1),
      }),
    )
    .optional(),
  collageId: z.string().uuid().nullable().optional(),
  featuredCollectionId: z.string().uuid().nullable().optional(),
});

export const aboutUpdateSchema = z.object({
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
});

export const siteUpdateSchema = z.object({
  name: z.string().min(1),
  tagline: z.string().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  contactAddress: z.string().min(1),
  social: z
    .union([
      z.object({
        nirvanaYogaInstagram: z.string().min(1),
        justArtAffaireInstagram: z.string().min(1),
      }),
      z.array(
        z.object({
          label: z.string().min(1),
          href: z.string().min(1),
        }),
      ),
    ])
    .optional(),
  branding: z
    .object({
      nirvanaYoga: z.object({
        logoSrc: z.string().min(1),
        logoScale: z.number().min(0.5).max(4),
      }),
      justArtAffaire: z.object({
        logoSrc: z.string().min(1),
        logoScale: z.number().min(0.5).max(4),
      }),
    })
    .optional(),
  navigation: z
    .array(
      z.object({
        label: z.string().min(1),
        href: z.string().min(1),
      }),
    )
    .optional(),
  homepageLayout: z
    .object({
      heroPaddingY: z.number().int().min(0).max(300),
      heroMinHeightVh: z.number().int().min(0).max(100),
      sectionGap: z.number().int().min(0).max(300),
      galleryPaddingTop: z.number().int().min(0).max(300),
      galleryHeight: z.number().int().min(0).max(800),
      siteBackground: z.enum(["aurora", "mandala", "horizon", "ripple"]).optional(),
      sectionLayouts: z.record(z.string(), sectionLayoutSchema).optional(),
    })
    .optional(),
  homepageSections: z.record(z.string(), z.unknown()).optional(),
  timelineStyleDefaults: z
    .object({
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
    })
    .optional(),
  timelineStyleByPage: z
    .record(
      z.enum(["YOGA", "HEALING", "JUST_ART_LIFE", "ABOUT"]),
      z.object({
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
      }),
    )
    .optional(),
  designSettingsByPage: z
    .record(z.enum(PAGE_TYPES), designSettingsOverrideSchema)
    .optional(),
  designSettings: designSettingsInputSchema,
});

/** Partial SiteConfig updates — merges with existing row (homepage sections, layout, etc.). */
export const sitePatchSchema = siteUpdateSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: "No fields to update." });

export function formatZodErrors(error: z.ZodError) {
  return error.issues.map((issue) => {
    const path = issue.path.length ? issue.path.join(".") : "body";
    return `${path}: ${issue.message}`;
  });
}
