"use client";

import type { ContentBlock } from "@/content/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { MotionStagger } from "@/components/program/MotionReveal";
import { useProgramTheme } from "@/components/program/ProgramThemeProvider";
import { cn } from "@/lib/utils";

type ContentBlockListProps = {
  items: ContentBlock[];
  emptyTitle: string;
  emptyDescription?: string;
  className?: string;
};

export function ContentBlockList({
  items,
  emptyTitle,
  emptyDescription,
  className,
}: ContentBlockListProps) {
  const theme = useProgramTheme();

  if (items.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <MotionStagger className={cn("grid gap-6 md:grid-cols-2", className)} stagger={0.1}>
      {items.map((item) => (
        <article
          key={item.id}
          className={cn(
            "rounded-2xl border border-border/60 bg-card p-8 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(42,36,31,0.08)]",
            theme.cardClass,
          )}
        >
          <div className="mb-4 h-px w-10 bg-accent/50" aria-hidden />
          <h2 className="font-display text-xl font-medium text-foreground sm:text-2xl">{item.title}</h2>
          <p className="mt-4 text-sm leading-[var(--leading-calm)] text-muted sm:text-base">{item.body}</p>
        </article>
      ))}
    </MotionStagger>
  );
}
