import { z } from "zod";
import { LOCAL_UPLOAD_PATH_REGEX } from "@/lib/upload-url";

const imageUrlField = z.union([
  z.string().url(),
  z.string().regex(LOCAL_UPLOAD_PATH_REGEX, "Invalid image URL"),
]);

export const EVENT_DETAIL_SECTION_TYPES = ["TEXT", "IMAGE", "IMAGE_TEXT"] as const;
export type EventDetailSectionType = (typeof EVENT_DETAIL_SECTION_TYPES)[number];

export type EventDetailTextSection = {
  id: string;
  type: "TEXT";
  title?: string;
  paragraphs: string[];
};

export type EventDetailImageSection = {
  id: string;
  type: "IMAGE";
  imageUrl: string;
  imageAlt: string;
  caption?: string;
};

export type EventDetailImageTextSection = {
  id: string;
  type: "IMAGE_TEXT";
  title?: string;
  imageUrl: string;
  imageAlt: string;
  paragraphs: string[];
  /** left/right = split layout; full = stacked full-width image above text */
  imagePosition?: "left" | "right" | "full";
};

export type EventDetailSection =
  | EventDetailTextSection
  | EventDetailImageSection
  | EventDetailImageTextSection;

export type EventDetailRegistration = {
  enabled: boolean;
  label: string;
  googleFormUrl: string;
};

export type EventDetailConfig = {
  enabled: boolean;
  subtitle?: string;
  sections: EventDetailSection[];
  registration?: EventDetailRegistration;
};

const textSectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("TEXT"),
  title: z.string().optional(),
  paragraphs: z.array(z.string()).default([]),
});

const imageSectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("IMAGE"),
  imageUrl: imageUrlField,
  imageAlt: z.string().min(1),
  caption: z.string().optional(),
});

const imageTextSectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("IMAGE_TEXT"),
  title: z.string().optional(),
  imageUrl: imageUrlField,
  imageAlt: z.string().min(1),
  paragraphs: z.array(z.string()).default([]),
  imagePosition: z.enum(["left", "right", "full"]).optional(),
});

export const eventDetailSectionSchema = z.discriminatedUnion("type", [
  textSectionSchema,
  imageSectionSchema,
  imageTextSectionSchema,
]);

export const eventDetailRegistrationSchema = z.object({
  enabled: z.boolean().default(false),
  label: z.string().default("Register for this Event"),
  googleFormUrl: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? "" : value),
    z.union([
      z.literal(""),
      z
        .string()
        .url()
        .refine((value) => value.startsWith("https://"), {
          message: "Google Form URL must use HTTPS",
        }),
    ]),
  ),
});

export const eventDetailConfigSchema = z.object({
  enabled: z.boolean().default(false),
  subtitle: z.string().optional(),
  sections: z.array(eventDetailSectionSchema).default([]),
  registration: eventDetailRegistrationSchema.optional(),
});

/** Blank / null CMS values clear the JSON column. */
export const nullableEventDetailSchema = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return null;
  return value;
}, z.union([eventDetailConfigSchema, z.null()]));

export const emptyEventDetail = (): EventDetailConfig => ({
  enabled: false,
  subtitle: "",
  sections: [],
  registration: {
    enabled: false,
    label: "Register for this Event",
    googleFormUrl: "",
  },
});

export function parseEventDetail(value: unknown): EventDetailConfig | null {
  if (value == null) return null;
  const parsed = eventDetailConfigSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function createEmptyEventDetailSection(type: EventDetailSectionType): EventDetailSection {
  const id = crypto.randomUUID();
  switch (type) {
    case "TEXT":
      return { id, type: "TEXT", paragraphs: [""] };
    case "IMAGE":
      return { id, type: "IMAGE", imageUrl: "", imageAlt: "" };
    case "IMAGE_TEXT":
      return {
        id,
        type: "IMAGE_TEXT",
        imageUrl: "",
        imageAlt: "",
        paragraphs: [""],
        imagePosition: "left",
      };
  }
}

export function sanitizeEventDetailForSave(detail: EventDetailConfig | null | undefined): EventDetailConfig | null {
  if (!detail) return null;

  const sections = detail.sections
    .map((section): EventDetailSection | null => {
      switch (section.type) {
        case "TEXT": {
          const paragraphs = section.paragraphs.map((p) => p.trim()).filter(Boolean);
          if (paragraphs.length === 0 && !section.title?.trim()) return null;
          const next: EventDetailTextSection = {
            id: section.id,
            type: "TEXT",
            paragraphs,
          };
          if (section.title?.trim()) next.title = section.title.trim();
          return next;
        }
        case "IMAGE": {
          if (!section.imageUrl.trim()) return null;
          const next: EventDetailImageSection = {
            id: section.id,
            type: "IMAGE",
            imageUrl: section.imageUrl.trim(),
            imageAlt: section.imageAlt.trim() || "Event image",
          };
          if (section.caption?.trim()) next.caption = section.caption.trim();
          return next;
        }
        case "IMAGE_TEXT": {
          const paragraphs = section.paragraphs.map((p) => p.trim()).filter(Boolean);
          if (!section.imageUrl.trim() && paragraphs.length === 0) return null;
          if (!section.imageUrl.trim()) {
            const asText: EventDetailTextSection = {
              id: section.id,
              type: "TEXT",
              paragraphs,
            };
            if (section.title?.trim()) asText.title = section.title.trim();
            return asText;
          }
          const next: EventDetailImageTextSection = {
            id: section.id,
            type: "IMAGE_TEXT",
            imageUrl: section.imageUrl.trim(),
            imageAlt: section.imageAlt.trim() || "Event image",
            paragraphs,
            imagePosition: section.imagePosition ?? "left",
          };
          if (section.title?.trim()) next.title = section.title.trim();
          return next;
        }
        default:
          return null;
      }
    })
    .filter((section): section is EventDetailSection => section !== null);

  const registration = detail.registration
    ? {
        enabled: Boolean(detail.registration.enabled && detail.registration.googleFormUrl.trim()),
        label: detail.registration.label.trim() || "Register for this Event",
        googleFormUrl: detail.registration.googleFormUrl.trim(),
      }
    : undefined;

  return {
    enabled: Boolean(detail.enabled),
    subtitle: detail.subtitle?.trim() || undefined,
    sections,
    registration,
  };
}

export function eventDetailHasReadableContent(detail: EventDetailConfig | null | undefined): boolean {
  if (!detail?.enabled) return false;
  if (detail.sections.length > 0) return true;
  if (detail.subtitle?.trim()) return true;
  if (detail.registration?.enabled && detail.registration.googleFormUrl.trim()) return true;
  return false;
}

const DEFAULT_PANEL_PLACEHOLDER =
  "Event details are being prepared. Please update this section from the Event CMS.";

/** True when an event should receive the default editable Read More panel. */
export function eventDetailNeedsBackfill(value: unknown): boolean {
  const parsed = parseEventDetail(value);
  if (!parsed) return true;
  if (!parsed.enabled) return true;
  if (!eventDetailHasReadableContent(parsed)) return true;
  return false;
}

/** Placeholder Read More panel for CMS editing — no invented event facts. */
export function createDefaultEventDetail(): EventDetailConfig {
  return {
    enabled: true,
    subtitle: "",
    sections: [
      {
        id: crypto.randomUUID(),
        type: "TEXT",
        title: "About this event",
        paragraphs: [DEFAULT_PANEL_PLACEHOLDER],
      },
    ],
    registration: {
      enabled: false,
      label: "Register for this Event",
      googleFormUrl: "",
    },
  };
}

/** HTTPS external event URLs only; blank clears. */
export const nullableHttpsUrlSchema = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return null;
  return value;
}, z.union([
  z
    .string()
    .url()
    .refine((value) => value.startsWith("https://"), {
      message: "External URL must use HTTPS",
    }),
  z.null(),
]));

