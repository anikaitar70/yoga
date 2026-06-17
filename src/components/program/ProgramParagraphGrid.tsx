"use client";

import { MotionReveal, MotionStagger } from "@/components/program/MotionReveal";
import { useProgramTheme } from "@/components/program/ProgramThemeProvider";
import { cn } from "@/lib/utils";

type ProgramParagraphGridProps = {
  paragraphs: string[];
  title?: string;
};

export function ProgramParagraphGrid({ paragraphs, title }: ProgramParagraphGridProps) {
  const theme = useProgramTheme();

  if (theme.motif === "organic") {
    return (
      <MotionStagger className="mx-auto max-w-3xl space-y-8" stagger={0.12}>
        {paragraphs.map((paragraph, index) => (
          <article
            key={`${title}-${index}`}
            className={cn(
              "relative rounded-2xl border border-primary/15 bg-card/80 p-8 shadow-[0_8px_40px_rgba(196,122,90,0.08)]",
              theme.cardClass,
            )}
          >
            <div className="absolute -left-px top-8 h-12 w-1 rounded-full bg-primary/40" aria-hidden />
            <p className="text-base leading-[var(--leading-calm)] text-muted">{paragraph}</p>
          </article>
        ))}
      </MotionStagger>
    );
  }

  if (theme.motif === "editorial") {
    return (
      <div className="space-y-12">
        {paragraphs.map((paragraph, index) => (
          <MotionReveal key={`${title}-${index}`} variant="slide-right" delay={index * 80}>
            <article className={cn("grid gap-6 lg:grid-cols-12 lg:items-start", index % 2 === 1 && "lg:text-right")}>
              <div className="lg:col-span-2">
                <span className="font-display text-4xl text-primary-soft">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <p
                className={cn(
                  "text-base leading-[var(--leading-calm)] text-muted lg:col-span-10",
                  index === 0 && "font-display text-xl text-foreground sm:text-2xl",
                )}
              >
                {paragraph}
              </p>
            </article>
          </MotionReveal>
        ))}
      </div>
    );
  }

  return (
    <MotionStagger className="grid gap-6 sm:grid-cols-2" stagger={0.1}>
      {paragraphs.map((paragraph, index) => (
        <article
          key={`${title}-${index}`}
          className={cn(
            "rounded-2xl border border-border/60 bg-card p-7 transition-shadow duration-500 hover:shadow-[0_12px_40px_rgba(42,36,31,0.08)]",
            theme.cardClass,
          )}
        >
          <div className="mb-4 h-px w-10 bg-accent/50" aria-hidden />
          <p className="text-sm leading-[var(--leading-calm)] text-muted sm:text-base">{paragraph}</p>
        </article>
      ))}
    </MotionStagger>
  );
}
