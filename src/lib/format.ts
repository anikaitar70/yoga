import type { Locale } from "@/lib/i18n/locale";
import { DEFAULT_LOCALE } from "@/lib/i18n/locale";

const DATE_LOCALES: Record<Locale, string> = {
  en: "en-US",
  ja: "ja-JP",
};

function resolveDateLocale(locale?: Locale): string {
  return DATE_LOCALES[locale ?? DEFAULT_LOCALE] ?? "en-US";
}

export function formatDate(dateIso: string, locale?: Locale): string {
  const formatter = new Intl.DateTimeFormat(resolveDateLocale(locale), {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return formatter.format(new Date(dateIso));
}

export function formatEventRange(dateIso: string, endIso?: string, locale?: Locale): string {
  const dateLocale = resolveDateLocale(locale);
  const start = new Date(dateIso);
  if (!endIso) {
    return new Intl.DateTimeFormat(dateLocale, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(start);
  }

  const end = new Date(endIso);
  const dayPart = new Intl.DateTimeFormat(dateLocale, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(start);
  const timeFormatter = new Intl.DateTimeFormat(dateLocale, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${dayPart} · ${timeFormatter.format(start)} – ${timeFormatter.format(end)}`;
}

export function formatPhoneHref(phone: string): string {
  return `tel:${phone.replace(/\D/g, "")}`;
}
