"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALE_LABELS, type Locale } from "@/lib/i18n/locale";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
  className?: string;
  compact?: boolean;
};

export function LanguageSwitcher({ className, compact = false }: LanguageSwitcherProps) {
  const pathname = usePathname() ?? "/";
  const { locale, switchLocalePath: toLocalePath } = useLocale();

  const options: Locale[] = ["en", "ja"];

  return (
    <div
      className={cn(
        "inline-flex rounded-full border border-border/70 bg-card/80 p-0.5",
        compact ? "text-[10px]" : "text-xs",
        className,
      )}
      role="group"
      aria-label="Language"
    >
      {options.map((option) => {
        const active = locale === option;
        const href = toLocalePath(pathname, option);
        return (
          <Link
            key={option}
            href={href}
            className={cn(
              "rounded-full px-2.5 py-1 font-semibold transition-colors",
              compact && "px-2 py-0.5",
              active
                ? "bg-slate-900 text-white"
                : "text-muted hover:bg-surface-warm hover:text-foreground",
            )}
            aria-current={active ? "true" : undefined}
            hrefLang={option === "ja" ? "ja" : "en"}
          >
            {LOCALE_LABELS[option]}
          </Link>
        );
      })}
    </div>
  );
}
