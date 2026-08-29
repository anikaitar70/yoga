import sanitizeHtml from "sanitize-html";
import {
  RICH_TEXT_ALLOWED_STYLES,
  RICH_TEXT_ALLOWED_TAGS,
  normalizePlainTextToHtml,
} from "@/lib/rich-text";

/**
 * Universal sanitizer for CMS rich-text fields.
 *
 * sanitize-html is pure JS (htmlparser2) so this module is safe in BOTH server
 * components and client bundles (e.g. the event Read More panel renders CMS
 * content client-side). Allowlist-based — strips scripts, event handlers,
 * URLs, and any style property not explicitly permitted
 * (background-color / color / text-align).
 */
export function sanitizeRichTextHtml(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "";

  const normalized = normalizePlainTextToHtml(value) as string;
  // Import dynamically to avoid circular dep — rich-text is pure, server imports it.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  // Use direct inline import: rich-text is already imported for types, but normalize is pure.
  return sanitizeHtml(normalized, {
    allowedTags: [...RICH_TEXT_ALLOWED_TAGS],
    allowedAttributes: {
      "*": ["style"],
    },
    allowedStyles: RICH_TEXT_ALLOWED_STYLES as never,
    allowedSchemes: [],
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
  });
}

/** Plain-text projection of a rich-text string (timelines, meta descriptions). */
export function sanitizeRichTextToPlainText(value: unknown): string {
  if (typeof value !== "string") return "";
  return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
}

/** Sanitize a list of paragraph strings — use before passing HTML into client components. */
export function sanitizeRichTextList(values: readonly unknown[]): string[] {
  return values.map((value) => sanitizeRichTextHtml(value));
}

/**
 * Save-time sanitizer for CustomTextSectionPayload-shaped objects:
 * paragraphs keep sanitized inline HTML; timeline rows are flattened to plain text.
 */
export function sanitizeCustomTextPayload(payload: unknown): unknown {
  if (!payload || typeof payload !== "object") return payload;
  const record: Record<string, unknown> = { ...(payload as Record<string, unknown>) };

  if (Array.isArray(record.paragraphs)) {
    record.paragraphs = record.paragraphs.map((paragraph) =>
      typeof paragraph === "string" ? sanitizeRichTextHtml(paragraph) : paragraph,
    );
  }

  const timeline = record.timeline;
  if (timeline && typeof timeline === "object") {
    const timelineRecord: Record<string, unknown> = { ...(timeline as Record<string, unknown>) };
    if (Array.isArray(timelineRecord.items)) {
      timelineRecord.items = timelineRecord.items.map((item) => {
        if (!item || typeof item !== "object") return item;
        const itemRecord: Record<string, unknown> = { ...(item as Record<string, unknown>) };
        if (typeof itemRecord.text === "string") {
          itemRecord.text = sanitizeRichTextToPlainText(itemRecord.text);
        }
        return itemRecord;
      });
    }
    record.timeline = timelineRecord;
  }

  return record;
}

export function sanitizeDynamicImageTextPayload(payload: unknown): unknown {
  if (!payload || typeof payload !== "object") return payload;
  const record: Record<string, unknown> = { ...(payload as Record<string, unknown>) };
  if (Array.isArray(record.items)) {
    record.items = record.items.map((raw) => {
      if (!raw || typeof raw !== "object") return raw;
      const item: Record<string, unknown> = { ...(raw as Record<string, unknown>) };
      if (typeof item.content === "string") {
        item.content = sanitizeRichTextHtml(item.content);
      }
      if (typeof item.contentJa === "string") {
        item.contentJa = sanitizeRichTextHtml(item.contentJa);
      }
      return item;
    });
  }
  return record;
}

/** Save-time sanitizer for BlogSection arrays (paragraphs + quotes). */
export function sanitizeBlogSectionList(sections: unknown): unknown {
  if (!Array.isArray(sections)) return sections;

  return sections.map((section) => {
    if (!section || typeof section !== "object") return section;
    const record: Record<string, unknown> = { ...(section as Record<string, unknown>) };

    if (Array.isArray(record.paragraphs)) {
      record.paragraphs = record.paragraphs.map((paragraph) =>
        typeof paragraph === "string" ? sanitizeRichTextHtml(paragraph) : paragraph,
      );
    }
    if (typeof record.quote === "string") {
      record.quote = sanitizeRichTextHtml(record.quote);
    }

    return record;
  });
}

/**
 * Save-time sanitizer for the SiteConfig.homepageSections blob:
 * sanitizes the free-form descriptive strings rendered as rich text.
 */
export function sanitizeHomepageSectionsRichText(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  const sections: Record<string, unknown> = { ...(value as Record<string, unknown>) };

  const sanitizeField = (source: unknown, field: string): unknown => {
    if (!source || typeof source !== "object") return source;
    const record: Record<string, unknown> = { ...(source as Record<string, unknown>) };
    if (typeof record[field] === "string") {
      record[field] = sanitizeRichTextHtml(record[field] as string);
    }
    return record;
  };

  sections.aboutPreview = sanitizeField(sections.aboutPreview, "body");
  sections.philosophy = sanitizeField(sections.philosophy, "closing");
  sections.newsletter = sanitizeField(sections.newsletter, "subtitle");

  if (Array.isArray(sections.pathways)) {
    sections.pathways = sections.pathways.map((pathway) =>
      sanitizeField(pathway, "description"),
    );
  }

  return sections;
}
