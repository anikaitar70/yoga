import type { TranslationReviewStatus } from "@prisma/client";
import type { Locale } from "@/lib/i18n/locale";
import { DEFAULT_LOCALE } from "@/lib/i18n/locale";

/** Locales that use machine translation and should show the disclaimer when not human-reviewed. */
export const MACHINE_TRANSLATED_LOCALES: readonly Locale[] = ["ja"];

export function isMachineTranslatedLocale(locale: Locale): boolean {
  return MACHINE_TRANSLATED_LOCALES.includes(locale);
}

export function shouldShowTranslationDisclaimer(
  locale: Locale,
  pageStatus: TranslationReviewStatus | undefined,
): boolean {
  if (locale === DEFAULT_LOCALE) return false;
  if (!isMachineTranslatedLocale(locale)) return false;
  return (pageStatus ?? "MACHINE") !== "HUMAN_REVIEWED";
}

export const TRANSLATION_DISCLAIMER_STORAGE_KEY = "nirvana_translation_disclaimer_dismissed";
