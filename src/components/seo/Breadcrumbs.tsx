"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { localizedPath } from "@/lib/i18n/paths";
import { uiMessage } from "@/lib/i18n/resolve";
import type { BreadcrumbItem } from "@/lib/seo/types";
import { cn } from "@/lib/utils";

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const { locale } = useLocale();
  const pathname = usePathname();

  if (items.length <= 1) return null;

  return (
    <nav aria-label={uiMessage(locale, "breadcrumbNav")} className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const href = localizedPath(item.href, locale);
          const isCurrent = href === pathname || item.href === pathname;

          return (
            <li key={`${item.href}-${index}`} className="flex items-center gap-2">
              {index > 0 ? (
                <span aria-hidden className="text-border select-none">
                  /
                </span>
              ) : null}
              {isLast || isCurrent ? (
                <span className="text-foreground/80" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={href}
                  className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-sm"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
