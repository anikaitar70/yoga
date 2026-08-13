import type { Locale } from "@/lib/i18n/locale";
import { DEFAULT_LOCALE } from "@/lib/i18n/locale";

/** Fixed zone so server (Docker UTC) and browsers render identical event date strings. */
export const EVENT_DISPLAY_TIME_ZONE = "Asia/Tokyo";

const DATE_LOCALES: Record<Locale, string> = {
  en: "en-US",
  ja: "ja-JP",
};

function resolveDateLocale(locale?: Locale): string {
  return DATE_LOCALES[locale ?? DEFAULT_LOCALE] ?? "en-US";
}

function eventDateTimeFormatOptions(
  locale: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormatOptions {
  return {
    timeZone: EVENT_DISPLAY_TIME_ZONE,
    ...options,
  };
}

export function formatDate(dateIso: string, locale?: Locale): string {
  const formatter = new Intl.DateTimeFormat(
    resolveDateLocale(locale),
    eventDateTimeFormatOptions(resolveDateLocale(locale), {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  );
  return formatter.format(new Date(dateIso));
}

export function formatEventRange(dateIso: string, endIso?: string, locale?: Locale): string {
  const dateLocale = resolveDateLocale(locale);
  const start = new Date(dateIso);
  if (!endIso) {
    return new Intl.DateTimeFormat(
      dateLocale,
      eventDateTimeFormatOptions(dateLocale, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
    ).format(start);
  }

  const end = new Date(endIso);
  const startParts = new Intl.DateTimeFormat(dateLocale, {
    timeZone: EVENT_DISPLAY_TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(start);
  const endParts = new Intl.DateTimeFormat(dateLocale, {
    timeZone: EVENT_DISPLAY_TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(end);

  const partValue = (parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;

  const sameCalendarDay =
    partValue(startParts, "year") === partValue(endParts, "year") &&
    partValue(startParts, "month") === partValue(endParts, "month") &&
    partValue(startParts, "day") === partValue(endParts, "day");

  if (!sameCalendarDay) {
    const dateFormatter = new Intl.DateTimeFormat(
      dateLocale,
      eventDateTimeFormatOptions(dateLocale, {
        month: "short",
        day: "numeric",
    year:
      partValue(startParts, "year") !== partValue(endParts, "year") ? "numeric" : undefined,
      }),
    );
    const startLabel = dateFormatter.format(start);
    const endLabel = dateFormatter.format(end);
    return `${startLabel} – ${endLabel}`;
  }

  const dayPart = new Intl.DateTimeFormat(
    dateLocale,
    eventDateTimeFormatOptions(dateLocale, {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
  ).format(start);
  const timeFormatter = new Intl.DateTimeFormat(
    dateLocale,
    eventDateTimeFormatOptions(dateLocale, {
      hour: "numeric",
      minute: "2-digit",
    }),
  );
  return `${dayPart} · ${timeFormatter.format(start)} – ${timeFormatter.format(end)}`;
}

export function formatPhoneHref(phone: string): string {
  return `tel:${phone.replace(/\D/g, "")}`;
}

