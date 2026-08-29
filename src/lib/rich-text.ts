import { z } from "zod";
import type { CSSProperties } from "react";

/**
 * Per-section text styling (whole-section toggles) + rich-text helpers.
 *
 * Inline formatting (bold/italic/underline/highlight/lists/alignment inside a
 * paragraph) is authored in the CMS as limited HTML strings. Strings crossing
 * the server→client boundary MUST be sanitized server-side first
 * (see src/lib/rich-text-server.ts); this module holds the shared shape
 * definitions, allowlists, and a browser-side sanitizer for unsaved drafts.
 */

export const SECTION_TEXT_ALIGN_OPTIONS = ["left", "center", "right", "justify"] as const;
export type SectionTextAlign = (typeof SECTION_TEXT_ALIGN_OPTIONS)[number];

/**
 * Whole-section text toggles. Alignment is intentionally NOT part of this
 * shape — it stays on the existing SectionLayoutSettings.textAlignment field
 * (extended to left|center|right|justify) so there is a single source of truth.
 */
export type SectionTextStyleSettings = {
  /** Bold the section's body text. */
  bold?: boolean;
  /** Italicize the section's body text. */
  italic?: boolean;
  /** Underline the section's body text. */
  underline?: boolean;
};

export const sectionTextStyleSchema = z.object({
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  underline: z.boolean().optional(),
});

export const SECTION_TEXT_ALIGN_LABELS: Record<SectionTextAlign, string> = {
  left: "Left",
  center: "Center",
  right: "Right",
  justify: "Justify",
};

/** Tags permitted in CMS rich-text fields. Kept intentionally minimal. */
export const RICH_TEXT_ALLOWED_TAGS = [
  "p",
  "br",
  "b",
  "strong",
  "i",
  "em",
  "u",
  "s",
  "span",
  "mark",
  "ul",
  "ol",
  "li",
  "h3",
  "h4",
  "div",
] as const;

/** Style properties permitted per tag family, with value patterns. */
export const RICH_TEXT_ALLOWED_STYLES: Record<string, RegExp[]> = {
  "background-color": [
    /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/,
    /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/,
    /^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(?:0|1|0?\.\d+)\s*\)$/,
  ],
  color: [
    /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/,
    /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/,
    /^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(?:0|1|0?\.\d+)\s*\)$/,
  ],
  "text-align": [/^(?:left|center|right|justify)$/, /^#!important$/],
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Parse untrusted JSON into SectionTextStyleSettings (undefined when absent/empty). */
export function parseSectionTextStyle(value: unknown): SectionTextStyleSettings | undefined {
  if (!isPlainObject(value)) return undefined;
  const parsed = sectionTextStyleSchema.safeParse(value);
  if (!parsed.success) return undefined;

  const settings = parsed.data;
  const hasAny = settings.bold || settings.italic || settings.underline;
  return hasAny ? settings : undefined;
}

/** Inline CSS applying the whole-section text toggles. */
export function sectionTextStyleToCss(
  style: SectionTextStyleSettings | null | undefined,
): CSSProperties | undefined {
  if (!style) return undefined;
  const css: Record<string, string> = {};
  if (style.bold) css.fontWeight = "700";
  if (style.italic) css.fontStyle = "italic";
  if (style.underline) css.textDecorationLine = "underline";
  return Object.keys(css).length > 0 ? (css as CSSProperties) : undefined;
}

const BLOCK_LEVEL_TAG_PATTERN =
  /<(?:p|div|ul|ol|li|h[1-6]|blockquote|table)\b[\s>]/i;

/** True when an authored paragraph string carries its own block-level markup. */
export function isBlockLevelRichParagraph(html: string): boolean {
  return BLOCK_LEVEL_TAG_PATTERN.test(html ?? "");
}

/**
 * Convert plain-text paragraph breaks (blank lines) into HTML so that
 * authoring with double newlines preserves visual paragraph separation.
 * Block-level HTML passes through unchanged; plain text with \n is normalized.
 */
export function normalizePlainTextToHtml(value: string): string {
  if (!value || typeof value !== "string") return "";
  if (isBlockLevelRichParagraph(value)) return value;
  if (!value.includes("\n")) return value;
  // Split on blank line(s) into blocks
  const blocks = value
    .split(/\r?\n\s*\r?\n/)
    .map((block) => block.trim())
    .filter(Boolean);
  if (blocks.length <= 1) {
    // Single block — preserve single newlines as <br>
    return value.includes("\n") ? value.replace(/\r?\n/g, "<br>") : value;
  }
  // Multiple blocks — each becomes a <p>, single newlines inside a block become <br>
  return blocks
    .map((block) => `<p>${block.replace(/\r?\n/g, "<br>")}</p>`)
    .join("");
}

/** Strip every tag — used where consumers need plain text (timelines, meta). */
export function richTextToPlainText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

type SanitizeNodeResult = Node | null;

function filterStyleAttribute(
  doc: Document,
  rawStyle: string | null,
  allowed: Record<string, RegExp[]>,
): string | null {
  if (!rawStyle) return null;
  const kept: string[] = [];
  for (const declaration of rawStyle.split(";")) {
    const separator = declaration.indexOf(":");
    if (separator <= 0) continue;
    const property = declaration.slice(0, separator).trim().toLowerCase();
    const value = declaration.slice(separator + 1).trim();
    if (!property || !value) continue;
    const patterns = allowed[property];
    if (!patterns) continue;
    if (!patterns.some((pattern) => pattern.test(value))) continue;
    kept.push(`${property}: ${value}`);
  }
  return kept.length > 0 ? kept.join("; ") : null;
}

function sanitizeDomNode(
  doc: Document,
  source: Node,
  allowedTags: ReadonlySet<string>,
  allowedStyles: Record<string, RegExp[]>,
): SanitizeNodeResult {
  if (source.nodeType === Node.TEXT_NODE) {
    return doc.createTextNode(source.nodeValue ?? "");
  }
  if (source.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const element = source as Element;
  const tagName = element.tagName.toLowerCase();

  if (tagName === "br") {
    return doc.createElement("br");
  }
  if (!allowedTags.has(tagName)) {
    // Unwrap disallowed elements but keep their (sanitized) children.
    const fragment = doc.createDocumentFragment();
    for (const child of Array.from(element.childNodes)) {
      const sanitizedChild = sanitizeDomNode(doc, child, allowedTags, allowedStyles);
      if (sanitizedChild) fragment.appendChild(sanitizedChild);
    }
    return fragment;
  }

  const cleanElement = doc.createElement(tagName);
  const style = filterStyleAttribute(doc, element.getAttribute("style"), allowedStyles);
  if (style) {
    cleanElement.setAttribute("style", style);
  }

  for (const child of Array.from(element.childNodes)) {
    const sanitizedChild = sanitizeDomNode(doc, child, allowedTags, allowedStyles);
    if (sanitizedChild) cleanElement.appendChild(sanitizedChild);
  }
  return cleanElement;
}

/**
 * Browser-side sanitizer for UNSAVED admin drafts (live preview).
 * Production/server rendering must use sanitizeRichTextHtml() instead.
 */
export function sanitizeRichTextHtmlDraft(html: string): string {
  if (typeof html !== "string" || !html.trim()) return "";
  const normalized = normalizePlainTextToHtml(html);
  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    // Never attempt DOM parsing outside the browser — drop formatting entirely.
    return richTextToPlainText(normalized);
  }

  const doc = new DOMParser().parseFromString("<!doctype html><html><body></body></html>", "text/html");
  const allowedTags = new Set<string>(RICH_TEXT_ALLOWED_TAGS);
  const fragment = doc.createDocumentFragment();
  const parserBody = new DOMParser().parseFromString(
    `<!doctype html><html><body>${normalized}</body></html>`,
    "text/html",
  ).body;

  for (const child of Array.from(parserBody.childNodes)) {
    const sanitizedChild = sanitizeDomNode(doc, child, allowedTags, RICH_TEXT_ALLOWED_STYLES);
    if (sanitizedChild) fragment.appendChild(sanitizedChild);
  }

  const holder = doc.createElement("div");
  holder.appendChild(fragment);
  return holder.innerHTML;
}
