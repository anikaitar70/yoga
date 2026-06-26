export const LOCALES = ["en", "ja"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_COOKIE = "nirvana_locale";
export const LOCALE_HEADER = "x-nirvana-locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  ja: "日本語",
};

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "ja";
}

export function localeFromPathname(pathname: string): Locale | null {
  if (pathname === "/ja" || pathname.startsWith("/ja/")) {
    return "ja";
  }
  return null;
}

export function stripLocalePrefix(pathname: string): string {
  if (pathname === "/ja") return "/";
  if (pathname.startsWith("/ja/")) return pathname.slice(3) || "/";
  return pathname;
}
