"use client";

import { cn } from "@/lib/utils";
import type { SpecialEventTocDesign, SpecialEventTocItem } from "@/lib/event-page-section";
import { tocDesignToContainerStyle, tocDesignToListStyle, tocDesignToStyle } from "@/lib/event-page-section";

type Props = {
  items: SpecialEventTocItem[];
  className?: string;
  title?: string;
  design?: SpecialEventTocDesign | null;
};

export function SpecialEventTableOfContents({ items, className, title = "On this page", design }: Props) {
  if (items.length === 0) return null;
  const textStyle = tocDesignToStyle(design);
  const containerStyle = tocDesignToContainerStyle(design);
  const listStyle = tocDesignToListStyle(design);

  return (
    <nav aria-label={title} className={cn("rounded-2xl border border-border/70 bg-surface/60 p-6", className)} style={containerStyle}>
      <h2 className="font-display text-lg font-medium text-foreground" style={textStyle}>{title}</h2>
      <ol className={cn("mt-4", listStyle ? "" : "space-y-2")} style={{ ...textStyle, ...listStyle }}>
        {items.map((item) => (
          <li key={item.id} style={textStyle}>
            <a
              href={`#${item.anchorSlug}`}
              className="text-sm text-primary-muted transition hover:text-primary hover:underline"
              style={textStyle}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
