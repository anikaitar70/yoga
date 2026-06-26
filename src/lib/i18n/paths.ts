import type { Locale } from "@/lib/i18n/locale";
import { DEFAULT_LOCALE } from "@/lib/i18n/locale";

/** Public path with optional /ja prefix (English stays unprefixed). */
export function localizedPath(path: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) {
    return path.startsWith("/") ? path : `/${path}`;
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === "/") return "/ja";
  return `/ja${normalized}`;
}

/** Switch locale while preserving the current page path. */
export function switchLocalePath(currentPath: string, targetLocale: Locale): string {
  const withoutJa =
    currentPath === "/ja" ? "/" : currentPath.startsWith("/ja/") ? currentPath.slice(3) || "/" : currentPath;
  return localizedPath(withoutJa, targetLocale);
}

export function localizeHref(href: string, locale: Locale): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  if (href.startsWith("/admin") || href.startsWith("/api")) return href;
  return localizedPath(href, locale);
}
