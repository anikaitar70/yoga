"use client";

import { MotionReveal } from "@/components/program/MotionReveal";
import { NumberedTimelineList } from "@/components/content/timeline/NumberedTimelineList";
import { TimelineStyleShell } from "@/components/content/timeline/TimelineStyleShell";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import type { CustomTextSectionPayload, JourneyHighlightPayload } from "@/lib/page-section-types";
import {
  activeHighlights,
  highlightsEnabled,
  resolveTimelineItems,
  splitJourneyParagraphs,
} from "@/lib/custom-text-payload";
import type { TimelineStyleSettings } from "@/lib/timeline-style";
import { cn } from "@/lib/utils";

type ArtJourneySectionProps = {
  title?: string | null;
  subtitle?: string | null;
  paragraphs: string[];
  payload?: CustomTextSectionPayload | null;
  highlights?: JourneyHighlightPayload[];
  introParagraphCount?: number;
  closingParagraphCount?: number;
  timelineStyle?: TimelineStyleSettings | null;
};

function highlightsAfterIndex(highlights: JourneyHighlightPayload[], index: number) {
  return highlights.filter((item) => item.afterIndex === index);
}

function HighlightCard({ highlight, delay }: { highlight: JourneyHighlightPayload; delay: number }) {
  return (
    <MotionReveal variant="slide-right" delay={delay}>
      <figure className="relative mx-auto max-w-2xl rounded-2xl border border-border/60 bg-surface-warm/50 px-8 py-8 text-center shadow-[0_10px_40px_rgba(42,36,31,0.06)] sm:px-10">
        {highlight.label ? (
          <Eyebrow className="mb-4 justify-center">{highlight.label}</Eyebrow>
        ) : null}
        <blockquote className="program-quote-art font-display text-lg leading-snug text-foreground sm:text-xl">
          {highlight.text}
        </blockquote>
      </figure>
    </MotionReveal>
  );
}

export function ArtJourneySection({
  title,
  subtitle,
  paragraphs,
  payload,
  highlights = [],
  introParagraphCount = 2,
  closingParagraphCount = 1,
  timelineStyle,
}: ArtJourneySectionProps) {
  const { intro, body, closing, introEnd } = splitJourneyParagraphs(
    paragraphs,
    introParagraphCount,
    closingParagraphCount,
  );
  const callouts = activeHighlights(highlights, highlightsEnabled(payload));
  const timelineItems = resolveTimelineItems(payload, body, introEnd);
  const showTimeline = payload?.timeline?.enabled !== false && timelineItems.length > 0;

  return (
    <TimelineStyleShell style={timelineStyle} className="program-art-journey mx-auto max-w-3xl">
      {title ? (
        <SectionHeading
          title={title}
          subtitle={subtitle || undefined}
          align="center"
          className="mb-14"
        />
      ) : null}

      <div className="space-y-12">
        {intro.map((paragraph, index) => (
          <MotionReveal key={`intro-${index}`} variant="slide-right" delay={index * 90}>
            <p
              className={cn(
                "leading-[var(--leading-calm)] text-muted",
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

        {showTimeline
          ? timelineItems.map((item, index) => {
              const absoluteIndex = introEnd + index;
              const inserted = highlightsAfterIndex(callouts, absoluteIndex);

              return (
                <div key={`timeline-${index}`} className="space-y-12">
                  <MotionReveal variant="slide-right" delay={140 + index * 70}>
                    <NumberedTimelineList items={[item]} />
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
            })
          : body.map((paragraph, index) => {
              const absoluteIndex = introEnd + index;
              const inserted = highlightsAfterIndex(callouts, absoluteIndex);

              return (
                <div key={`body-${index}`} className="space-y-12">
                  <MotionReveal variant="slide-right" delay={140 + index * 70}>
                    <p className="text-base leading-[var(--leading-calm)] text-muted sm:text-lg">{paragraph}</p>
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
          <MotionReveal variant="rise" delay={300}>
            <div className="rounded-2xl border border-primary/15 bg-surface-warm/60 px-8 py-8 text-center">
              {closing.map((paragraph, index) => (
                <p
                  key={`closing-${index}`}
                  className="font-display text-lg leading-snug text-foreground sm:text-xl"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </MotionReveal>
        ) : null}
      </div>
    </TimelineStyleShell>
  );
}
