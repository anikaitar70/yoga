"use client";

import { MotionReveal } from "@/components/program/MotionReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import type { CustomTextSectionPayload, JourneyHighlightPayload } from "@/lib/page-section-types";
import { activeHighlights, highlightsEnabled, splitJourneyParagraphs } from "@/lib/custom-text-payload";
import { cn } from "@/lib/utils";

type HealingJourneySectionProps = {
  title?: string | null;
  subtitle?: string | null;
  paragraphs: string[];
  payload?: CustomTextSectionPayload | null;
  highlights?: JourneyHighlightPayload[];
  introParagraphCount?: number;
  closingParagraphCount?: number;
};

function highlightsAfterIndex(highlights: JourneyHighlightPayload[], index: number) {
  return highlights.filter((item) => item.afterIndex === index);
}

function HighlightCard({ highlight, delay }: { highlight: JourneyHighlightPayload; delay: number }) {
  return (
    <MotionReveal variant="rise" delay={delay}>
      <figure className="relative mx-auto max-w-2xl rounded-2xl border border-primary/20 bg-primary-soft/25 px-8 py-8 text-center shadow-[0_12px_48px_rgba(196,122,90,0.1)] sm:px-10">
        <div
          className="pointer-events-none absolute inset-x-12 top-1/2 -z-10 h-24 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />
        {highlight.label ? (
          <Eyebrow className="mb-4 justify-center text-primary-muted">{highlight.label}</Eyebrow>
        ) : null}
        <blockquote className="program-quote-healing font-display text-lg leading-snug text-foreground sm:text-xl">
          {highlight.text}
        </blockquote>
      </figure>
    </MotionReveal>
  );
}

export function HealingJourneySection({
  title,
  subtitle,
  paragraphs,
  payload,
  highlights = [],
  introParagraphCount = 2,
  closingParagraphCount = 2,
}: HealingJourneySectionProps) {
  const { intro, body, closing, introEnd } = splitJourneyParagraphs(
    paragraphs,
    introParagraphCount,
    closingParagraphCount,
  );
  const callouts = activeHighlights(highlights, highlightsEnabled(payload));

  return (
    <div className="program-healing-journey mx-auto max-w-3xl">
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
          className="absolute left-6 top-0 hidden h-full w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent md:block"
          aria-hidden
        />

        {intro.map((paragraph, index) => (
          <MotionReveal key={`intro-${index}`} variant="rise" delay={index * 90}>
            <p
              className={cn(
                "leading-[var(--leading-calm)] text-muted md:pl-10",
                index === 0
                  ? "font-display text-xl text-foreground sm:text-2xl md:text-[1.65rem]"
                  : "text-base sm:text-lg",
              )}
            >
              {paragraph}
            </p>
          </MotionReveal>
        ))}

        {highlightsAfterIndex(callouts, introEnd - 1).map((highlight, index) => (
          <HighlightCard key={`pre-body-${index}`} highlight={highlight} delay={120 + index * 40} />
        ))}

        {body.map((paragraph, index) => {
          const absoluteIndex = introEnd + index;
          const inserted = highlightsAfterIndex(callouts, absoluteIndex);

          return (
            <div key={`body-${index}`} className="space-y-10">
              <MotionReveal variant="rise" delay={140 + index * 70}>
                <article className="relative rounded-xl border border-primary/10 bg-card/70 px-6 py-5 md:ml-10 md:pl-8">
                  <div
                    className="absolute left-0 top-6 hidden h-10 w-1 rounded-full bg-primary/35 md:block"
                    aria-hidden
                  />
                  <p className="text-base leading-[var(--leading-calm)] text-muted sm:text-lg">{paragraph}</p>
                </article>
              </MotionReveal>
              {inserted.map((highlight, hi) => (
                <HighlightCard
                  key={`highlight-${absoluteIndex}-${hi}`}
                  highlight={highlight}
                  delay={180 + index * 70 + hi * 40}
                />
              ))}
            </div>
          );
        })}

        {closing.length > 0 ? (
          <MotionReveal variant="rise" delay={320}>
            <div className="space-y-4 rounded-2xl border border-primary/15 bg-primary-soft/20 px-8 py-8 text-center md:ml-6">
              {closing.map((paragraph, index) => (
                <p
                  key={`closing-${index}`}
                  className={cn(
                    "leading-[var(--leading-calm)]",
                    index === closing.length - 1
                      ? "font-display text-lg text-foreground sm:text-xl"
                      : "text-base text-muted sm:text-lg",
                  )}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </MotionReveal>
        ) : null}
      </div>
    </div>
  );
}
