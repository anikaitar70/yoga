"use client";

import { YogaSutraPassage } from "@/components/content/YogaSutraPassage";
import { MotionReveal } from "@/components/program/MotionReveal";
import type { YogaSutraPassage as SutraPassage } from "@/content/types";
import { splitJourneyParagraphs } from "@/lib/custom-text-payload";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

type YogaJourneySectionProps = {
  title?: string | null;
  subtitle?: string | null;
  paragraphs: string[];
  sutra?: SutraPassage;
  introParagraphCount?: number;
  closingParagraphCount?: number;
};

export function YogaJourneySection({
  title,
  subtitle,
  paragraphs,
  sutra,
  introParagraphCount = 2,
  closingParagraphCount = 1,
}: YogaJourneySectionProps) {
  const { intro, body: middle, closing, introEnd: _introEnd } = splitJourneyParagraphs(
    paragraphs,
    introParagraphCount,
    closingParagraphCount,
  );
  const closingBlock = closing.length > 0 ? closing[closing.length - 1] : null;

  return (
    <div className="program-yoga-journey mx-auto max-w-3xl">
      {title ? (
        <SectionHeading
          title={title}
          subtitle={subtitle || undefined}
          align="center"
          className="mb-14"
        />
      ) : null}

      <div className="relative space-y-10">
        <div
          className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-accent/25 to-transparent md:block"
          aria-hidden
        />

        {intro.map((paragraph, index) => (
          <MotionReveal key={`intro-${index}`} variant="rise" delay={index * 90}>
            <p
              className={cn(
                "text-center leading-[var(--leading-calm)] text-muted",
                index === 0
                  ? "font-display text-xl text-foreground sm:text-2xl md:text-[1.65rem]"
                  : "text-base sm:text-lg",
              )}
            >
              {paragraph}
            </p>
          </MotionReveal>
        ))}

        {sutra ? (
          <div className="relative py-4 md:py-8">
            <div
              className="pointer-events-none absolute inset-x-8 top-1/2 -z-10 h-32 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl"
              aria-hidden
            />
            <YogaSutraPassage
              sutra={sutra}
              className="border-accent/20 bg-card/90 shadow-[0_8px_48px_rgba(122,138,106,0.12)]"
              delay={120}
            />
          </div>
        ) : null}

        {middle.length > 0 ? (
          <div className="space-y-8">
            {middle.map((paragraph, index) => (
              <MotionReveal key={`body-${index}`} variant="rise" delay={160 + index * 80}>
                <blockquote
                  className={cn(
                    "relative rounded-xl border border-border/50 bg-background/80 px-6 py-5 text-center sm:px-8",
                    index === 0 && "program-quote-yoga border-l-4 pl-6 text-left sm:pl-8",
                  )}
                >
                  <p className="text-base leading-[var(--leading-calm)] text-muted sm:text-lg">
                    {paragraph}
                  </p>
                </blockquote>
              </MotionReveal>
            ))}
          </div>
        ) : null}

        {closingBlock ? (
          <MotionReveal variant="rise" delay={280}>
            <p className="rounded-2xl border border-accent/15 bg-accent-soft/30 px-8 py-7 text-center font-display text-lg leading-snug text-foreground sm:text-xl">
              {closingBlock}
            </p>
          </MotionReveal>
        ) : null}
      </div>
    </div>
  );
}
