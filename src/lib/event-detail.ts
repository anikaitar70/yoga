import { z } from "zod";
import { LOCAL_UPLOAD_PATH_REGEX } from "@/lib/upload-url";
import type { Locale } from "@/lib/i18n/locale";
import { DEFAULT_LOCALE } from "@/lib/i18n/locale";
import {
  lookupJaEventDetailPatch,
  mergeMachineRegistration,
} from "@/lib/i18n/translations/ja-event-details";

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

export type EventDetailLocaleContent = {
  subtitle?: string;
  sections: EventDetailSection[];
  registration?: EventDetailRegistration;
};

/** Stored in Prisma JSON — bilingual content under `en` / `ja`. */
export type EventDetailConfig = {
  enabled: boolean;
  en: EventDetailLocaleContent;
  ja?: EventDetailLocaleContent;
};

/** Flattened detail used by public UI after locale resolution. */
export type ResolvedEventDetail = {
  enabled: boolean;
  subtitle?: string;
  sections: EventDetailSection[];
  registration?: EventDetailRegistration;
  /** True when Japanese locale fell back to English panel content. */
  usingEnglishFallback?: boolean;
  /** True when Japanese content comes from machine-translation patches (not human-reviewed CMS). */
  usingMachineTranslation?: boolean;
};

export type EventDetailResolveContext = {
  slug: string;
  title: string;
  jaTranslationStatus?: "MACHINE" | "HUMAN_REVIEWED";
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

const localeContentSchema = z.object({
  subtitle: z.string().optional(),
  sections: z.array(eventDetailSectionSchema).default([]),
  registration: eventDetailRegistrationSchema.optional(),
});

const localizedEventDetailSchema = z.object({
  enabled: z.boolean().default(false),
  en: localeContentSchema,
  ja: localeContentSchema.optional(),
});

/** Legacy flat shape stored before bilingual panels. */
const legacyEventDetailSchema = z.object({
  enabled: z.boolean().default(false),
  subtitle: z.string().optional(),
  sections: z.array(eventDetailSectionSchema).default([]),
  registration: eventDetailRegistrationSchema.optional(),
});

export const eventDetailConfigSchema = z.union([localizedEventDetailSchema, legacyEventDetailSchema]);

/** Blank / null CMS values clear the JSON column. */
export const nullableEventDetailSchema = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return null;
  return value;
}, z.union([eventDetailConfigSchema, z.null()]));

const DEFAULT_REGISTRATION_EN: EventDetailRegistration = {
  enabled: false,
  label: "Register for this Event",
  googleFormUrl: "",
};

const DEFAULT_REGISTRATION_JA: EventDetailRegistration = {
  enabled: false,
  label: "このイベントに登録する",
  googleFormUrl: "",
};

export const emptyEventDetailLocale = (): EventDetailLocaleContent => ({
  subtitle: "",
  sections: [],
  registration: { ...DEFAULT_REGISTRATION_EN },
});

export const emptyEventDetailLocaleJa = (): EventDetailLocaleContent => ({
  subtitle: "",
  sections: [],
  registration: { ...DEFAULT_REGISTRATION_JA },
});

export const emptyEventDetail = (): EventDetailConfig => ({
  enabled: false,
  en: emptyEventDetailLocale(),
  ja: emptyEventDetailLocaleJa(),
});

function isLegacyDetail(value: z.infer<typeof legacyEventDetailSchema>): boolean {
  return !("en" in value);
}

function sectionHasReadableContent(section: EventDetailSection): boolean {
  switch (section.type) {
    case "TEXT":
      return section.paragraphs.some((paragraph) => paragraph.trim()) || Boolean(section.title?.trim());
    case "IMAGE":
      return Boolean(section.imageUrl.trim());
    case "IMAGE_TEXT":
      return (
        Boolean(section.imageUrl.trim()) ||
        section.paragraphs.some((paragraph) => paragraph.trim()) ||
        Boolean(section.title?.trim())
      );
    default:
      return false;
  }
}

/** Mirror English section layout so the Japanese CMS tab is ready to translate. */
export function scaffoldJaFromEn(en: EventDetailLocaleContent): EventDetailLocaleContent {
  if (isDefaultEnglishPlaceholder(en)) {
    return buildDefaultJapanesePlaceholder(en);
  }

  return {
    subtitle: "",
    sections: en.sections.map((section) => {
      if (section.type === "TEXT") {
        return {
          id: crypto.randomUUID(),
          type: "TEXT" as const,
          title: "",
          paragraphs: [""],
        };
      }
      if (section.type === "IMAGE") {
        return { ...section };
      }
      return {
        id: crypto.randomUUID(),
        type: "IMAGE_TEXT" as const,
        title: "",
        imageUrl: section.imageUrl,
        imageAlt: section.imageAlt,
        paragraphs: [""],
        imagePosition: section.imagePosition ?? "left",
      };
    }),
    registration: {
      enabled: Boolean(en.registration?.enabled),
      label: DEFAULT_REGISTRATION_JA.label,
      googleFormUrl: en.registration?.googleFormUrl ?? "",
    },
  };
}

export function normalizeEventDetailConfig(detail: EventDetailConfig | null | undefined): EventDetailConfig {
  const base = emptyEventDetail();
  if (!detail) return base;

  const en = {
    ...emptyEventDetailLocale(),
    ...detail.en,
    sections: detail.en?.sections ?? [],
    registration: detail.en?.registration ?? { ...DEFAULT_REGISTRATION_EN },
  };

  const ja = detail.ja
    ? (() => {
        const merged = {
          ...emptyEventDetailLocaleJa(),
          ...detail.ja,
          sections: detail.ja.sections ?? [],
          registration: detail.ja.registration ?? { ...DEFAULT_REGISTRATION_JA },
        };
        if (!localeContentHasReadableBody(merged) && isDefaultEnglishPlaceholder(en)) {
          return buildDefaultJapanesePlaceholder(en);
        }
        return merged;
      })()
    : scaffoldJaFromEn(en);

  return {
    enabled: Boolean(detail.enabled),
    en,
    ja,
  };
}

function migrateLegacyDetail(value: z.infer<typeof legacyEventDetailSchema>): EventDetailConfig {
  const en: EventDetailLocaleContent = {
    subtitle: value.subtitle,
    sections: value.sections,
    registration: value.registration ?? { ...DEFAULT_REGISTRATION_EN },
  };
  return {
    enabled: Boolean(value.enabled),
    en,
    ja: scaffoldJaFromEn(en),
  };
}

export function parseEventDetail(value: unknown): EventDetailConfig | null {
  if (value == null) return null;
  const parsed = eventDetailConfigSchema.safeParse(value);
  if (!parsed.success) return null;
  if (isLegacyDetail(parsed.data as z.infer<typeof legacyEventDetailSchema>)) {
    return migrateLegacyDetail(parsed.data as z.infer<typeof legacyEventDetailSchema>);
  }
  const localized = parsed.data as z.infer<typeof localizedEventDetailSchema>;
  return normalizeEventDetailConfig({
    enabled: localized.enabled,
    en: localized.en,
    ja: localized.ja,
  });
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

function sanitizeLocaleContent(
  content: EventDetailLocaleContent,
  defaultRegistration: EventDetailRegistration,
): EventDetailLocaleContent {
  const sections = content.sections
    .map((section): EventDetailSection | null => {
      switch (section.type) {
        case "TEXT": {
          const paragraphs = section.paragraphs.map((p) => p.trim()).filter(Boolean);
          if (paragraphs.length === 0 && !section.title?.trim()) return null;
          const next: EventDetailTextSection = { id: section.id, type: "TEXT", paragraphs };
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
            const asText: EventDetailTextSection = { id: section.id, type: "TEXT", paragraphs };
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

  const registration = content.registration
    ? {
        enabled: Boolean(content.registration.enabled && content.registration.googleFormUrl.trim()),
        label: content.registration.label.trim() || defaultRegistration.label,
        googleFormUrl: content.registration.googleFormUrl.trim(),
      }
    : undefined;

  return {
    subtitle: content.subtitle?.trim() || undefined,
    sections,
    registration,
  };
}

export function sanitizeEventDetailForSave(detail: EventDetailConfig | null | undefined): EventDetailConfig | null {
  if (!detail) return null;

  const normalized = normalizeEventDetailConfig(detail);
  const en = sanitizeLocaleContent(normalized.en, DEFAULT_REGISTRATION_EN);
  let ja = sanitizeLocaleContent(normalized.ja ?? scaffoldJaFromEn(en), DEFAULT_REGISTRATION_JA);

  if (en.registration?.googleFormUrl) {
    const jaReg = ja.registration ?? { ...DEFAULT_REGISTRATION_JA };
    ja = {
      ...ja,
      registration: {
        enabled: Boolean(jaReg.enabled || en.registration.enabled),
        label: jaReg.label,
        googleFormUrl: jaReg.googleFormUrl.trim() || en.registration.googleFormUrl,
      },
    };
  }

  return {
    enabled: Boolean(detail.enabled),
    en,
    ja,
  };
}

function localeContentHasReadableBody(content: EventDetailLocaleContent | undefined): boolean {
  if (!content) return false;
  if (content.sections.some(sectionHasReadableContent)) return true;
  if (content.subtitle?.trim()) return true;
  return false;
}

export function resolveEventDetail(
  detail: EventDetailConfig | null | undefined,
  locale: Locale,
  context?: EventDetailResolveContext,
): ResolvedEventDetail | null {
  if (!detail?.enabled) return null;

  const english = detail.en;
  const japanese = detail.ja;
  const preferJapanese = locale !== DEFAULT_LOCALE;

  if (!preferJapanese) {
    if (!localeContentHasReadableBody(english)) return null;
    return {
      enabled: true,
      subtitle: english!.subtitle,
      sections: english!.sections,
      registration: english!.registration,
    };
  }

  if (localeContentHasReadableBody(japanese)) {
    return {
      enabled: true,
      subtitle: japanese!.subtitle,
      sections: japanese!.sections,
      registration: japanese!.registration,
      usingMachineTranslation: false,
      usingEnglishFallback: false,
    };
  }

  const machine = context ? lookupJaEventDetailPatch(context) : undefined;
  if (machine && localeContentHasReadableBody(machine)) {
    return {
      enabled: true,
      subtitle: machine.subtitle,
      sections: machine.sections,
      registration: mergeMachineRegistration(machine, english!),
      usingMachineTranslation: true,
      usingEnglishFallback: false,
    };
  }

  if (isDefaultEnglishPlaceholder(english)) {
    const placeholder = buildDefaultJapanesePlaceholder(english!);
    return {
      enabled: true,
      subtitle: placeholder.subtitle,
      sections: placeholder.sections,
      registration: placeholder.registration,
      usingMachineTranslation: true,
      usingEnglishFallback: false,
    };
  }

  if (localeContentHasReadableBody(english)) {
    return {
      enabled: true,
      subtitle: english!.subtitle,
      sections: english!.sections,
      registration: english!.registration,
      usingEnglishFallback: true,
      usingMachineTranslation: false,
    };
  }

  return null;
}

export function eventDetailHasReadableContent(
  detail: EventDetailConfig | null | undefined,
  locale: Locale = DEFAULT_LOCALE,
  context?: EventDetailResolveContext,
): boolean {
  return resolveEventDetail(detail, locale, context) !== null;
}

const DEFAULT_PANEL_PLACEHOLDER =
  "Event details are being prepared. Please update this section from the Event CMS.";
const DEFAULT_SECTION_TITLE_EN = "About this event";
const DEFAULT_PANEL_PLACEHOLDER_JA =
  "イベントの詳細を準備中です。イベント管理画面から内容を更新してください。";
const DEFAULT_SECTION_TITLE_JA = "このイベントについて";

function isDefaultEnglishPlaceholder(en: EventDetailLocaleContent): boolean {
  if (en.subtitle?.trim()) return false;
  if (en.sections.length !== 1) return false;
  const section = en.sections[0];
  if (section.type !== "TEXT") return false;
  const title = section.title?.trim() ?? "";
  if (title && title !== DEFAULT_SECTION_TITLE_EN) return false;
  const paragraphs = section.paragraphs.map((paragraph) => paragraph.trim()).filter(Boolean);
  if (paragraphs.length !== 1) return false;
  return paragraphs[0] === DEFAULT_PANEL_PLACEHOLDER;
}

function buildDefaultJapanesePlaceholder(en: EventDetailLocaleContent): EventDetailLocaleContent {
  return {
    subtitle: "",
    sections: [
      {
        id: crypto.randomUUID(),
        type: "TEXT",
        title: DEFAULT_SECTION_TITLE_JA,
        paragraphs: [DEFAULT_PANEL_PLACEHOLDER_JA],
      },
    ],
    registration: {
      enabled: Boolean(en.registration?.enabled),
      label: DEFAULT_REGISTRATION_JA.label,
      googleFormUrl: en.registration?.googleFormUrl ?? "",
    },
  };
}

/** True when an event should receive the default editable Read More panel. */
export function eventDetailNeedsBackfill(value: unknown): boolean {
  const parsed = parseEventDetail(value);
  if (!parsed) return true;
  if (!parsed.enabled) return true;
  if (!eventDetailHasReadableContent(parsed, DEFAULT_LOCALE)) return true;
  return false;
}

/** Placeholder Read More panel for CMS editing — no invented event facts. */
export function createDefaultEventDetail(): EventDetailConfig {
  return {
    enabled: true,
    en: {
      subtitle: "",
      sections: [
        {
          id: crypto.randomUUID(),
          type: "TEXT",
          title: "About this event",
          paragraphs: [DEFAULT_PANEL_PLACEHOLDER],
        },
      ],
      registration: { ...DEFAULT_REGISTRATION_EN },
    },
    ja: {
      subtitle: "",
      sections: [
        {
          id: crypto.randomUUID(),
          type: "TEXT",
          title: DEFAULT_SECTION_TITLE_JA,
          paragraphs: [DEFAULT_PANEL_PLACEHOLDER_JA],
        },
      ],
      registration: { ...DEFAULT_REGISTRATION_JA },
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
