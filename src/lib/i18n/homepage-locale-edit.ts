import type { HomepageSectionsContent } from "@/lib/homepage-sections";
import type { LocaleHomepageSectionsPatch } from "@/lib/i18n/locale-content";
import { DEFAULT_LOCALE } from "@/lib/i18n/locale";
import { mergeHomepagePatchForLocale } from "@/lib/i18n/homepage-merge";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clearStrings(value: unknown): unknown {
  if (typeof value === "string") return "";
  if (Array.isArray(value)) return value.map(clearStrings);
  if (isPlainObject(value)) {
    const next: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
      next[key] = clearStrings(child);
    }
    return next;
  }
  return value;
}

/** JA tab editor view: empty strings unless a manual JA override exists. */
export function homepageJaEditView(
  en: HomepageSectionsContent,
  ja: LocaleHomepageSectionsPatch,
): HomepageSectionsContent {
  const blank = clearStrings(structuredClone(en)) as HomepageSectionsContent;
  return mergeHomepagePatchForLocale(blank, ja, DEFAULT_LOCALE);
}

/** Persist only fields that differ from the English homepage sections. */
export function extractHomepageJaPatch(
  en: HomepageSectionsContent,
  edited: HomepageSectionsContent,
): LocaleHomepageSectionsPatch {
  return deepDiffPatch(en, edited) as LocaleHomepageSectionsPatch;
}

function deepDiffPatch(base: unknown, edited: unknown): unknown {
  if (typeof base === "string" && typeof edited === "string") {
    return edited !== base && edited.trim() ? edited : undefined;
  }
  if (Array.isArray(base) && Array.isArray(edited)) {
    const length = Math.max(base.length, edited.length);
    const items: unknown[] = [];
    let changed = false;
    for (let index = 0; index < length; index += 1) {
      const diff = deepDiffPatch(base[index], edited[index]);
      if (diff !== undefined) {
        changed = true;
        items[index] = diff;
      }
    }
    return changed ? items : undefined;
  }
  if (isPlainObject(base) && isPlainObject(edited)) {
    const patch: Record<string, unknown> = {};
    const keys = new Set([...Object.keys(base), ...Object.keys(edited)]);
    for (const key of keys) {
      const diff = deepDiffPatch(base[key], edited[key]);
      if (diff !== undefined) patch[key] = diff;
    }
    return Object.keys(patch).length > 0 ? patch : undefined;
  }
  return undefined;
}
