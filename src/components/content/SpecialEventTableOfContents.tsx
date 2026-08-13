"use client";

import { cn } from "@/lib/utils";
import type { SpecialEventTocItem } from "@/lib/event-page-section";

type Props = {
  items: SpecialEventTocItem[];
  className?: string;
  title?: string;
};

export function SpecialEventTableOfContents({ items, className, title = "On this page" }: Props) {
  if (items.length === 0) return null;

  return (
    <nav aria-label={title} className={cn("rounded-2xl border border-border/70 bg-surface/60 p-6", className)}>
      <h2 className="font-display text-lg font-medium text-foreground">{title}</h2>
      <ol className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.anchorSlug}`}
              className="text-sm text-primary-muted transition hover:text-primary hover:underline"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
