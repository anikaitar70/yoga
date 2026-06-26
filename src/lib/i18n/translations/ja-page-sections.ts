import type { LocalePageSectionPatch } from "@/lib/i18n/locale-content";
import type { PageType } from "@/lib/page-section-types";
import { JA_YOGA_SECTIONS } from "@/lib/i18n/translations/ja-sections-yoga";
import { JA_HEALING_SECTIONS } from "@/lib/i18n/translations/ja-sections-healing";
import { JA_JUST_ART_SECTIONS } from "@/lib/i18n/translations/ja-sections-just-art";
import { JA_ABOUT_SECTIONS } from "@/lib/i18n/translations/ja-sections-about";

/** Japanese page-section overrides aligned by sort order (index) per page type. */
export const JA_PAGE_SECTIONS: Partial<Record<PageType, LocalePageSectionPatch[]>> = {
  YOGA: JA_YOGA_SECTIONS,
  HEALING: JA_HEALING_SECTIONS,
  JUST_ART_LIFE: JA_JUST_ART_SECTIONS,
  ABOUT: JA_ABOUT_SECTIONS,
};
