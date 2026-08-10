import type { NavItem } from "@/content/types";
import type { HomepageSectionsContent } from "@/lib/homepage-sections";
import type { PageType, PageSectionRecord } from "@/lib/page-section-types";

type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;

export type LocaleHomepageSectionsPatch = DeepPartial<HomepageSectionsContent>;

export type LocaleHeroContent = {
  title?: string;
  subtitle?: string;
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
  imageAlt?: string;
};

export type LocaleAboutPageContent = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  imageAlt?: string;
  paragraphs?: string[];
};

export type LocalePageIntroPatch = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
};

export type LocalePageIntrosPatch = Partial<Record<string, LocalePageIntroPatch>>;

export type LocalePageSectionPatch = {
  title?: string | null;
  subtitle?: string | null;
  content?: string | null;
  imageAlt?: string | null;
  payload?: DeepPartial<NonNullable<PageSectionRecord["payload"]>>;
};

export type LocaleSitePatch = {
  name?: string;
  tagline?: string;
  navigation?: NavItem[];
};

export type LocaleBundle = {
  site?: LocaleSitePatch;
  hero?: LocaleHeroContent;
  homepageSections?: LocaleHomepageSectionsPatch;
  aboutPage?: LocaleAboutPageContent;
  pageIntros?: LocalePageIntrosPatch;
  pageSections?: Partial<Record<PageType, LocalePageSectionPatch[]>>;
  ui?: Record<string, string>;
};

export type LocaleContentStore = {
  ja?: LocaleBundle;
};

export function parseLocaleContent(value: unknown): LocaleContentStore | null {
  if (!value || typeof value !== "object") return null;
  return value as LocaleContentStore;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeShallowSkipEmpty<T extends Record<string, unknown>>(
  base: T | undefined,
  override: Partial<T> | undefined,
): T | undefined {
  if (!base && !override) return undefined;
  if (!base) return override as T;
  if (!override) return base;
  const merged = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (typeof value === "string" && !value.trim()) continue;
    if (value !== undefined) merged[key as keyof T] = value as T[keyof T];
  }
  return merged;
}

/** Deep-merge CMS locale overrides onto static defaults. */
export function mergeLocaleBundle(
  base: LocaleBundle | undefined,
  override: LocaleBundle | undefined,
): LocaleBundle | undefined {
  if (!base && !override) return undefined;
  if (!base) return override;
  if (!override) return base;

  const merged: LocaleBundle = { ...base };

  if (override.site) {
    merged.site = mergeShallowSkipEmpty(base.site, override.site);
  }
  if (override.hero) {
    merged.hero = mergeShallowSkipEmpty(base.hero, override.hero);
  }
  if (override.aboutPage) {
    merged.aboutPage = mergeShallowSkipEmpty(base.aboutPage, override.aboutPage);
  }
  if (override.pageIntros) {
    merged.pageIntros = { ...base.pageIntros };
    for (const [key, intro] of Object.entries(override.pageIntros)) {
      merged.pageIntros![key] = mergeShallowSkipEmpty(base.pageIntros?.[key], intro) ?? intro;
    }
  }
  if (override.ui) {
    merged.ui = mergeShallowSkipEmpty(base.ui, override.ui);
  }
  if (override.homepageSections) {
    merged.homepageSections = deepMergeRecordsSkipEmpty(
      (base.homepageSections ?? {}) as Record<string, unknown>,
      override.homepageSections as Record<string, unknown>,
    ) as Partial<HomepageSectionsContent>;
  }
  if (override.pageSections) {
    merged.pageSections = { ...base.pageSections };
    for (const [pageType, sections] of Object.entries(override.pageSections)) {
      const baseSections = base.pageSections?.[pageType as PageType] ?? [];
      merged.pageSections![pageType as PageType] = sections.map((section, index) =>
        mergeShallowSkipEmpty(baseSections[index], section) ?? section,
      );
    }
  }

  return merged;
}

function deepMergeRecordsSkipEmpty(
  base: Record<string, unknown>,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  const next: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (typeof value === "string" && !value.trim()) continue;
    if (isPlainObject(value) && isPlainObject(next[key])) {
      next[key] = deepMergeRecordsSkipEmpty(next[key] as Record<string, unknown>, value);
    } else if (value !== undefined) {
      next[key] = value;
    }
  }
  return next;
}
