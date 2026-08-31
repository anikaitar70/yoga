import { freeTranslatePlainText, freeTranslateRichHtml } from "@/lib/translate-server";
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

// Batch helper for site-wide translation
export async function translateMissingJaFields(): Promise<{ count: number; errors: string[] }> {
  const { prisma } = await import("@/lib/prisma");
  let count = 0;
  const errors: string[] = [];

  // Events
  try {
    const events = await prisma.event.findMany();
    for (const ev of events) {
      const ja = (ev.jaLocale as Record<string, unknown> | null) ?? {};
      let needsUpdate = false;
      const nextJa: Record<string, unknown> = { ...ja };
      if (!ja.title || !(ja.title as string)?.trim()) {
        try {
          nextJa.title = await freeTranslatePlainText(ev.title);
          needsUpdate = true;
        } catch (e) {
          errors.push(`event ${ev.id} title: ${String(e)}`);
        }
      }
      if (!ja.description || !(ja.description as string)?.trim()) {
        try {
          nextJa.description = await freeTranslateRichHtml(ev.description);
          needsUpdate = true;
        } catch (e) {
          errors.push(`event ${ev.id} description: ${String(e)}`);
        }
      }
      if (!ja.location || !(ja.location as string)?.trim()) {
        try {
          nextJa.location = await freeTranslatePlainText(ev.location);
          needsUpdate = true;
        } catch (e) {
          errors.push(`event ${ev.id} location: ${String(e)}`);
        }
      }
      if (needsUpdate) {
        await prisma.event.update({ where: { id: ev.id }, data: { jaLocale: nextJa as any } });
        count++;
      }
    }
  } catch (e) {
    errors.push(`events batch: ${String(e)}`);
  }

  // BlogPosts
  try {
    const posts = await prisma.blogPost.findMany();
    for (const post of posts) {
      const ja = (post.jaLocale as Record<string, unknown> | null) ?? {};
      let needsUpdate = false;
      const nextJa: Record<string, unknown> = { ...ja };
      if (!ja.title || !(ja.title as string)?.trim()) {
        try {
          nextJa.title = await freeTranslatePlainText(post.title);
          needsUpdate = true;
        } catch (e) {
          errors.push(`blog ${post.id} title: ${String(e)}`);
        }
      }
      if (!ja.summary || !(ja.summary as string)?.trim()) {
        try {
          nextJa.summary = await freeTranslatePlainText(post.summary);
          needsUpdate = true;
        } catch (e) {
          errors.push(`blog ${post.id} summary: ${String(e)}`);
        }
      }
      if (!ja.content || !(ja.content as string)?.trim()) {
        try {
          nextJa.content = await freeTranslateRichHtml(post.content);
          needsUpdate = true;
        } catch (e) {
          errors.push(`blog ${post.id} content: ${String(e)}`);
        }
      }
      if (needsUpdate) {
        await prisma.blogPost.update({ where: { id: post.id }, data: { jaLocale: nextJa as any } });
        count++;
      }
    }
  } catch (e) {
    errors.push(`blogs batch: ${String(e)}`);
  }

  // Testimonials
  try {
    const testimonials = await prisma.testimonial.findMany();
    for (const t of testimonials) {
      const ja = (t.jaLocale as Record<string, unknown> | null) ?? {};
      let needsUpdate = false;
      const nextJa: Record<string, unknown> = { ...ja };
      if (!ja.quote || !(ja.quote as string)?.trim()) {
        try {
          nextJa.quote = await freeTranslateRichHtml(t.quote);
          needsUpdate = true;
        } catch (e) {
          errors.push(`testimonial ${t.id} quote: ${String(e)}`);
        }
      }
      if (!ja.role || !(ja.role as string)?.trim()) {
        try {
          nextJa.role = await freeTranslatePlainText(t.role);
          needsUpdate = true;
        } catch (e) {
          errors.push(`testimonial ${t.id} role: ${String(e)}`);
        }
      }
      if (needsUpdate) {
        await prisma.testimonial.update({ where: { id: t.id }, data: { jaLocale: nextJa as any } });
        count++;
      }
    }
  } catch (e) {
    errors.push(`testimonials batch: ${String(e)}`);
  }

  // EventPageSections
  try {
    const sections = await prisma.eventPageSection.findMany();
    for (const s of sections) {
      const ja = (s.jaLocale as Record<string, unknown> | null) ?? {};
      let needsUpdate = false;
      const nextJa: Record<string, unknown> = { ...ja };
      if ((!ja.title || !(ja.title as string)?.trim()) && s.title?.trim()) {
        try {
          nextJa.title = await freeTranslatePlainText(s.title);
          needsUpdate = true;
        } catch (e) {
          errors.push(`eventSection ${s.id} title: ${String(e)}`);
        }
      }
      if ((!ja.subtitle || !(ja.subtitle as string)?.trim()) && s.subtitle?.trim()) {
        try {
          nextJa.subtitle = await freeTranslatePlainText(s.subtitle);
          needsUpdate = true;
        } catch (e) {
          errors.push(`eventSection ${s.id} subtitle: ${String(e)}`);
        }
      }
      if ((!ja.content || !(ja.content as string)?.trim()) && s.content?.trim()) {
        try {
          nextJa.content = await freeTranslateRichHtml(s.content);
          needsUpdate = true;
        } catch (e) {
          errors.push(`eventSection ${s.id} content: ${String(e)}`);
        }
      }
      if (needsUpdate) {
        await prisma.eventPageSection.update({ where: { id: s.id }, data: { jaLocale: nextJa as any } });
        count++;
      }
    }
  } catch (e) {
    errors.push(`eventSections batch: ${String(e)}`);
  }

  // PageSections via SiteConfig.localeContent is more complex — handled via runtime fallback, not persisted here

  return { count, errors };
}
