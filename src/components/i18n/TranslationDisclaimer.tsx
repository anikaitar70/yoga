"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/i18n/LocaleProvider";
import {
  isMachineTranslatedLocale,
  TRANSLATION_DISCLAIMER_STORAGE_KEY,
} from "@/lib/i18n/translation-review";
import { uiMessage } from "@/lib/i18n/resolve";
import { cn } from "@/lib/utils";

type TranslationDisclaimerProps = {
  /** Optional server-known status; when omitted, fetched client-side per route. */
  humanReviewed?: boolean;
};

function storageKey(locale: string): string {
  return `${TRANSLATION_DISCLAIMER_STORAGE_KEY}:${locale}`;
}

export function TranslationDisclaimer({ humanReviewed }: TranslationDisclaimerProps) {
  const { locale } = useLocale();
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [reviewed, setReviewed] = useState(humanReviewed ?? false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(storageKey(locale));
      setDismissed(stored === "1");
    } catch {
      setDismissed(false);
    }
  }, [locale, pathname]);

  useEffect(() => {
    if (humanReviewed !== undefined) {
      setReviewed(humanReviewed);
      return;
    }
    if (!isMachineTranslatedLocale(locale)) return;

    let cancelled = false;
    const path = pathname || "/";

    fetch(`/api/public/translation-status?path=${encodeURIComponent(path)}&locale=${locale}`)
      .then((res) => res.json())
      .then((data: { show?: boolean; pageStatus?: string }) => {
        if (!cancelled) {
          setReviewed(data.pageStatus === "HUMAN_REVIEWED");
        }
      })
      .catch(() => {
        if (!cancelled) setReviewed(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pathname, locale, humanReviewed]);

  const shouldShow =
    mounted &&
    isMachineTranslatedLocale(locale) &&
    !reviewed &&
    !dismissed;

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(storageKey(locale));
      setDismissed(stored === "1");
    } catch {
      setDismissed(false);
    }
  }, [locale, pathname]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      localStorage.setItem(storageKey(locale), "1");
    } catch {
      // ignore
    }
  }, [locale]);

  if (!shouldShow) return null;

  return (
    <div
      role="status"
      className={cn(
        "fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg sm:left-auto sm:right-6",
        "rounded-2xl border border-border/80 bg-surface/95 px-4 py-3 shadow-lg backdrop-blur-md",
        "animate-in fade-in slide-in-from-bottom-2 duration-300",
      )}
    >
      <div className="flex items-start gap-3">
        <p className="flex-1 text-sm leading-relaxed text-muted">
          {uiMessage(locale, "translationDisclaimer")}
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-foreground/70 transition-colors hover:bg-border/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          aria-label={uiMessage(locale, "translationDisclaimerDismiss")}
        >
          {uiMessage(locale, "translationDisclaimerDismiss")}
        </button>
      </div>
    </div>
  );
}
