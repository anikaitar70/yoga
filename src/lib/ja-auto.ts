import type { Prisma } from "@prisma/client";
import {
  freeTranslatePlainText,
  freeTranslateRichHtml,
  tryTranslatePlainText,
  tryTranslateRichHtml,
  type PlainTranslator,
} from "@/lib/translate-server";
import { sanitizeRichTextHtml } from "@/lib/rich-text-server";

/**
 * Automatic JA fallback using free SMT/NMT (no GEMINI_API_KEY required).
 * If JA text is present, returns it. Otherwise translates EN via free provider.
 * isHtml indicates whether to preserve HTML tags.
 */

export async function autoJaPlain(en: string, ja?: string | null): Promise<string> {
  const jaTrim = typeof ja === "string" ? ja.trim() : "";
  if (jaTrim) return jaTrim;
  const enTrim = (en ?? "").trim();
  if (!enTrim) return en;
  try {
    const translated = await freeTranslatePlainText(enTrim);
    return translated || en;
  } catch {
    return en;
  }
}

export async function autoJaHtml(en: string, ja?: string | null): Promise<string> {
  const jaTrim = typeof ja === "string" ? ja.trim() : "";
  if (jaTrim) return sanitizeRichTextHtml(jaTrim);
  const enTrim = (en ?? "").trim();
  if (!enTrim) return en;
  try {
    const translated = await freeTranslateRichHtml(enTrim);
    return translated || sanitizeRichTextHtml(en);
  } catch {
    return sanitizeRichTextHtml(en);
  }
}

// Runtime auto-fallback for Japanese site — translates EN on-the-fly when JA missing (no manual click)
export async function autoLocalizeEventWithFallback(event: import("@/content/types").Event, locale: string): Promise<import("@/content/types").Event> {
  if (locale !== "ja") return event;
  const ja = (event.jaLocale as Record<string, unknown> | null) ?? {};
  let title = event.title;
  let description = event.description;
  let location = event.location;
  let label = event.externalLinkLabel;
  let changed = false;
  if (!ja.title?.toString().trim()) {
    const t = await autoJaPlain(event.title, null);
    if (t !== event.title) { title = t; changed = true; }
  }
  if (!ja.description?.toString().trim()) {
    const t = await autoJaHtml(event.description, null);
    if (t !== event.description) { description = t; changed = true; }
  }
  if (!ja.location?.toString().trim()) {
    const t = await autoJaPlain(event.location, null);
    if (t !== event.location) { location = t; changed = true; }
  }
  if (event.externalLinkLabel && !ja.externalLinkLabel?.toString().trim()) {
    const t = await autoJaPlain(event.externalLinkLabel, null);
    if (t !== event.externalLinkLabel) { label = t; changed = true; }
  }
  if (!changed) return event;
  return { ...event, title, description, location, externalLinkLabel: label };
}

export async function autoLocalizeEventsWithFallback(events: import("@/content/types").Event[], locale: string): Promise<import("@/content/types").Event[]> {
  if (locale !== "ja") return events;
  // Translate sequentially to avoid flooding free API, but allow parallel with limit
  const results: import("@/content/types").Event[] = [];
  for (const ev of events) {
    results.push(await autoLocalizeEventWithFallback(ev, locale));
  }
  return results;
}

export async function autoLocalizePageSectionsWithFallback(
  sections: import("@/lib/page-section-types").PageSectionRecord[],
  locale: string,
): Promise<import("@/lib/page-section-types").PageSectionRecord[]> {
  if (locale !== "ja") return sections;
  const out: import("@/lib/page-section-types").PageSectionRecord[] = [];
  for (const s of sections) {
    // PageSection JA is via localeContent, not per-section jaLocale — here we auto-translate title/subtitle/content if they look like English and no JA override exists
    // Since we don't have per-section JA storage here, we translate on-the-fly when locale is ja and content is English
    let title = s.title;
    let subtitle = s.subtitle;
    let content = s.content;
    // Heuristic: if section was returned as English fallback (no JA patch), translate
    if (s.title?.trim()) {
      const t = await autoJaPlain(s.title, null);
      if (t !== s.title) title = t;
    }
    if (s.subtitle?.trim()) {
      const t = await autoJaPlain(s.subtitle, null);
      if (t !== s.subtitle) subtitle = t;
    }
    if (s.content?.trim()) {
      const t = await autoJaHtml(s.content, null);
      if (t !== s.content) content = t;
    }
    out.push({ ...s, title, subtitle, content });
  }
  return out;
}

type JaField = { key: string; source: string | null | undefined; html?: boolean };

/**
 * Fills only the empty JA fields of one record (manual JA text is never touched).
 * Returns the merged jaLocale, or null when nothing was added.
 * A field is skipped, not stored, when translation fails or returns the source unchanged.
 */
async function fillMissingJa(
  current: unknown,
  fields: JaField[],
  label: string,
  errors: string[],
  translate: PlainTranslator,
): Promise<Record<string, unknown> | null> {
  const ja = (current as Record<string, unknown> | null) ?? {};
  const next = { ...ja };
  let added = false;
  for (const { key, source, html } of fields) {
    const src = source?.trim();
    if (!src || (typeof ja[key] === "string" && (ja[key] as string).trim())) continue;
    const out = html ? await tryTranslateRichHtml(src, translate) : await translate(src);
    if (!out || out === src) {
      errors.push(`${label} ${key}: ${out ? "unchanged (likely a name or already Japanese)" : "translator failed (quota or error)"}`);
      continue;
    }
    next[key] = out;
    added = true;
  }
  return added ? next : null;
}

type PayloadRecord = Record<string, unknown>;

/**
 * Fills the inline JA fields the public renderers read from a section payload:
 * image-text `items[].contentJa` and button `labelJa` / `supportingTextJa`.
 * Returns the updated payload, or null when nothing was added.
 */
async function fillPayloadJa(
  payload: unknown,
  label: string,
  errors: string[],
  translate: PlainTranslator,
): Promise<PayloadRecord | null> {
  if (!payload || typeof payload !== "object") return null;
  const next = structuredClone(payload) as PayloadRecord;
  let added = false;

  async function fill(target: PayloadRecord, key: string, jaKey: string, html: boolean) {
    const src = typeof target[key] === "string" ? (target[key] as string).trim() : "";
    const hasJa = typeof target[jaKey] === "string" && (target[jaKey] as string).trim();
    if (!src || hasJa) return;
    const out = html ? await tryTranslateRichHtml(src, translate) : await translate(src);
    if (!out || out === src) {
      errors.push(`${label} payload.${jaKey}: ${out ? "unchanged" : "translator failed"}`);
      return;
    }
    target[jaKey] = out;
    added = true;
  }

  if (Array.isArray(next.items)) {
    for (const item of next.items as PayloadRecord[]) await fill(item, "content", "contentJa", true);
  }
  await fill(next, "label", "labelJa", false);
  await fill(next, "supportingText", "supportingTextJa", false);
  return added ? next : null;
}

/** Custom-text paragraphs have no inline JA field; event sections keep them in jaLocale.payload.paragraphs. */
async function fillParagraphsJa(
  payload: unknown,
  jaLocale: unknown,
  label: string,
  errors: string[],
  translate: PlainTranslator,
): Promise<Record<string, unknown> | null> {
  const paragraphs = (payload as PayloadRecord | null)?.paragraphs;
  const ja = (jaLocale as Record<string, unknown> | null) ?? {};
  const jaPayload = (ja.payload as PayloadRecord | undefined) ?? {};
  if (!Array.isArray(paragraphs) || !paragraphs.some((p) => typeof p === "string" && p.trim())) return null;
  if (Array.isArray(jaPayload.paragraphs) && jaPayload.paragraphs.length > 0) return null;

  const out: string[] = [];
  for (const para of paragraphs as string[]) {
    const src = para?.trim();
    const t = src ? await tryTranslateRichHtml(src, translate) : "";
    if (src && !t) {
      errors.push(`${label} payload.paragraphs: translator failed`);
      return null; // all-or-nothing keeps paragraph indexes aligned with the English
    }
    out.push(t ?? "");
  }
  return { ...ja, payload: { ...jaPayload, paragraphs: out } };
}

// Batch helper for site-wide translation (called by /api/cron/translate-ja and the admin button)
export async function translateMissingJaFields(
  translate: PlainTranslator = tryTranslatePlainText,
): Promise<{ count: number; errors: string[] }> {
  const { prisma } = await import("@/lib/prisma");
  let count = 0;
  const errors: string[] = [];

  async function run<T extends { id: string; jaLocale: unknown }>(
    name: string,
    rows: T[],
    fields: (row: T) => JaField[],
    save: (id: string, jaLocale: Prisma.InputJsonValue) => Promise<unknown>,
  ) {
    console.log(`[translate-ja] ${name}: checking ${rows.length} row(s)`);
    for (const row of rows) {
      try {
        const next = await fillMissingJa(row.jaLocale, fields(row), `${name} ${row.id}`, errors, translate);
        if (!next) continue;
        await save(row.id, next as Prisma.InputJsonValue);
        count++;
        console.log(`[translate-ja] saved ${name} ${row.id}`);
      } catch (e) {
        errors.push(`${name} ${row.id}: ${String(e)}`);
      }
    }
  }

  await run("event", await prisma.event.findMany(), (e) => [
    { key: "title", source: e.title },
    { key: "description", source: e.description, html: true },
    { key: "location", source: e.location },
    { key: "externalLinkLabel", source: e.externalLinkLabel },
  ], (id, jaLocale) => prisma.event.update({ where: { id }, data: { jaLocale } }));

  await run("blog", await prisma.blogPost.findMany(), (p) => [
    { key: "title", source: p.title },
    { key: "summary", source: p.summary },
    { key: "content", source: p.content, html: true },
  ], (id, jaLocale) => prisma.blogPost.update({ where: { id }, data: { jaLocale } }));

  await run("testimonial", await prisma.testimonial.findMany(), (t) => [
    { key: "quote", source: t.quote, html: true },
    { key: "role", source: t.role },
  ], (id, jaLocale) => prisma.testimonial.update({ where: { id }, data: { jaLocale } }));

  await run("eventSection", await prisma.eventPageSection.findMany(), (s) => [
    { key: "title", source: s.title },
    { key: "subtitle", source: s.subtitle },
    { key: "content", source: s.content, html: true },
  ], (id, jaLocale) => prisma.eventPageSection.update({ where: { id }, data: { jaLocale } }));

  // Section bodies live in payload (image-text items, button labels, custom-text paragraphs).
  for (const row of await prisma.eventPageSection.findMany()) {
    const label = `eventSection ${row.id}`;
    try {
      const payload = await fillPayloadJa(row.payload, label, errors, translate);
      const ja = await fillParagraphsJa(row.payload, row.jaLocale, label, errors, translate);
      if (!payload && !ja) continue;
      await prisma.eventPageSection.update({
        where: { id: row.id },
        data: {
          ...(payload ? { payload: payload as Prisma.InputJsonValue } : {}),
          ...(ja ? { jaLocale: ja as Prisma.InputJsonValue } : {}),
        },
      });
      count++;
      console.log(`[translate-ja] saved ${label} payload`);
    } catch (e) {
      errors.push(`${label} payload: ${String(e)}`);
    }
  }
  for (const row of await prisma.pageSection.findMany()) {
    const label = `pageSection ${row.id}`;
    try {
      const payload = await fillPayloadJa(row.payload, label, errors, translate);
      if (!payload) continue;
      await prisma.pageSection.update({ where: { id: row.id }, data: { payload: payload as Prisma.InputJsonValue } });
      count++;
      console.log(`[translate-ja] saved ${label} payload`);
    } catch (e) {
      errors.push(`${label} payload: ${String(e)}`);
    }
  }

  // PageSection / homepage JA lives in SiteConfig.localeContent keyed by list index, mixed with
  // hand-written static JA; its custom-text paragraphs are translated at request time instead, not persisted here.
  return { count, errors };
}
