"use client";

import type { ContentBlock } from "@/content/types";
import { MotionStagger } from "@/components/program/MotionReveal";
import { cn } from "@/lib/utils";

type HealingListProps = {
  items: ContentBlock[];
};

export function HealingList({ items }: HealingListProps) {
  return (
    <MotionStagger className="mx-auto max-w-3xl space-y-8" stagger={0.12}>
      {items.map((item) => (
        <li
          key={item.id}
          className={cn(
            "list-none rounded-2xl border border-primary/15 bg-card/90 p-8 shadow-[0_8px_40px_rgba(196,122,90,0.08)]",
            "relative pl-10",
          )}
        >
          <div className="absolute left-0 top-8 h-14 w-1 rounded-full bg-primary/35" aria-hidden />
          <h2 className="font-display text-2xl font-medium text-foreground">{item.title}</h2>
          <p className="mt-4 text-base leading-[var(--leading-calm)] text-muted">{item.body}</p>
        </li>
      ))}
    </MotionStagger>
  );
}
