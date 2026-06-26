import "server-only";

import { headers } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_HEADER, isLocale, type Locale } from "@/lib/i18n/locale";

export async function getLocale(): Promise<Locale> {
  const headerStore = await headers();
  const value = headerStore.get(LOCALE_HEADER);
  return value && isLocale(value) ? value : DEFAULT_LOCALE;
}
