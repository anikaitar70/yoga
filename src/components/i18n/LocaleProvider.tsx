"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n/locale";
import { DEFAULT_LOCALE } from "@/lib/i18n/locale";
import { localizedPath, switchLocalePath } from "@/lib/i18n/paths";

type LocaleContextValue = {
  locale: Locale;
  localizePath: (path: string) => string;
  switchLocalePath: (path: string, targetLocale: Locale) => string;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  localizePath: (path) => path,
  switchLocalePath: (path, targetLocale) => localizedPath(path, targetLocale),
});

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({
      locale,
      localizePath: (path: string) => localizedPath(path, locale),
      switchLocalePath: (path: string, targetLocale: Locale) =>
        switchLocalePath(path, targetLocale),
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}
