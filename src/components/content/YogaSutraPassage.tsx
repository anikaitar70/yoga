import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { YogaSutraPassage as SutraPassage } from "@/content/types";
import { cn } from "@/lib/utils";

type YogaSutraPassageProps = {
  sutra: SutraPassage;
  className?: string;
  delay?: number;
};

/** Premium visual block for a Yoga Sutra — Sanskrit through interpretation. */
export function YogaSutraPassage({ sutra, className, delay = 0 }: YogaSutraPassageProps) {
  return (
    <ScrollReveal animation="rise" delay={delay}>
      <article
        className={cn(
          "rounded-2xl border border-border/60 bg-card-elevated p-8 shadow-[0_4px_32px_rgba(42,36,31,0.05)] sm:p-10",
          className,
        )}
      >
        <p
          className="font-display text-3xl leading-relaxed text-primary-muted sm:text-4xl"
          lang="sa"
          dir="ltr"
        >
          {sutra.sanskrit}
        </p>
        <p className="mt-4 text-sm font-medium tracking-wide text-muted italic">
          {sutra.transliteration}
        </p>
        <blockquote className="mt-6 border-l-2 border-primary/40 pl-5 font-display text-xl leading-snug text-foreground sm:text-2xl">
          {sutra.translation}
        </blockquote>
        <p className="mt-3 text-xs font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-primary-muted">
          — {sutra.source}
        </p>
        {sutra.interpretation ? (
          <p className="mt-6 text-base leading-[var(--leading-calm)] text-muted">{sutra.interpretation}</p>
        ) : null}
      </article>
    </ScrollReveal>
  );
}
