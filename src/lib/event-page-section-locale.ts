import type { LocalePageSectionPatch } from "@/lib/i18n/locale-content";
import type { EventPageSectionRecord } from "@/lib/event-page-section";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locale";

export function parseEventPageSectionJaLocale(value: unknown): LocalePageSectionPatch | null {
  if (!value || typeof value !== "object") return null;
  return value as LocalePageSectionPatch;
}

export function compactEventPageSectionJaLocale(patch: LocalePageSectionPatch): LocalePageSectionPatch | null {
  const next: LocalePageSectionPatch = {};
  if (patch.title?.trim()) next.title = patch.title.trim();
  if (patch.subtitle?.trim()) next.subtitle = patch.subtitle.trim();
  if (patch.content?.trim()) next.content = patch.content.trim();
  if (patch.imageAlt?.trim()) next.imageAlt = patch.imageAlt.trim();
  if (patch.payload) next.payload = patch.payload;
  return Object.keys(next).length > 0 ? next : null;
}

function mergePayload(
  base: Record<string, unknown> | null,
  patch: LocalePageSectionPatch["payload"],
): Record<string, unknown> | null {
  if (!patch) return base;
  if (!base) return patch as Record<string, unknown>;
  return { ...base, ...patch };
}

export function localizeEventPageSection(
  section: EventPageSectionRecord,
  locale: Locale,
): EventPageSectionRecord {
  if (locale === DEFAULT_LOCALE) return section;
  const ja = section.jaLocale;
  if (!ja) return section;
  return {
    ...section,
    title: ja.title?.trim() ? ja.title : section.title,
    subtitle: ja.subtitle?.trim() ? ja.subtitle : section.subtitle,
    content: ja.content?.trim() ? ja.content : section.content,
    imageAlt: ja.imageAlt?.trim() ? ja.imageAlt : section.imageAlt,
    payload: mergePayload(section.payload, ja.payload),
  };
}

export function localizeEventPageSections(
  sections: EventPageSectionRecord[],
  locale: Locale,
): EventPageSectionRecord[] {
  if (locale === DEFAULT_LOCALE) return sections;
  return sections.map((section) => localizeEventPageSection(section, locale));
}
