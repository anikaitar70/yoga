import type { NavItem } from "@/content/types";
import type { HomepageSectionsContent } from "@/lib/homepage-sections";
import type { PageType } from "@/lib/page-section-types";
import type { PageSectionRecord } from "@/lib/page-section-types";

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
    merged.site = { ...base.site, ...override.site };
  }
  if (override.hero) {
    merged.hero = { ...base.hero, ...override.hero };
  }
  if (override.aboutPage) {
    merged.aboutPage = { ...base.aboutPage, ...override.aboutPage };
  }
  if (override.pageIntros) {
    merged.pageIntros = { ...base.pageIntros, ...override.pageIntros };
  }
  if (override.ui) {
    merged.ui = { ...base.ui, ...override.ui };
  }
  if (override.homepageSections) {
    merged.homepageSections = deepMergeRecords(
      (base.homepageSections ?? {}) as Record<string, unknown>,
      override.homepageSections as Record<string, unknown>,
    ) as Partial<HomepageSectionsContent>;
  }
  if (override.pageSections) {
    merged.pageSections = { ...base.pageSections, ...override.pageSections };
  }

  return merged;
}

function deepMergeRecords(
  base: Record<string, unknown>,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  const next: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (isPlainObject(value) && isPlainObject(next[key])) {
      next[key] = deepMergeRecords(next[key] as Record<string, unknown>, value);
    } else {
      next[key] = value;
    }
  }
  return next;
}
