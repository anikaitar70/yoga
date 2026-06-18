"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { cn } from "@/lib/utils";

export type VerticalTimelineItem = {
  year: string;
  title: string;
  body: string;
};

type VerticalTimelineListProps = {
  title?: string | null;
  items: VerticalTimelineItem[];
  className?: string;
  /** Skip scroll-reveal motion (preview studio). */
  staticReveal?: boolean;
};

/** Shared vertical timeline — year labels from CMS; styling via `.timeline-styled` CSS variables. */
export function VerticalTimelineList({
  title,
  items,
  className,
  staticReveal = false,
}: VerticalTimelineListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <>
      {title ? (
        <h2
          className="font-display font-medium tracking-[var(--tracking-display)]"
          style={{
            color: "var(--timeline-title-color)",
            fontFamily: "var(--timeline-title-font)",
            fontWeight: "var(--timeline-title-weight)",
            fontSize: "var(--timeline-title-size)",
          }}
        >
          {title}
        </h2>
      ) : null}
      <ol className={cn(title ? "relative mt-10 space-y-0" : "relative space-y-0", className)}>
        {items.map((item, index) => (
          <ScrollReveal
            key={`${item.year}-${item.title}-${index}`}
            animation={staticReveal ? "none" : "rise"}
            delay={index * 80}
            as="li"
            className="relative grid grid-cols-[minmax(5.5rem,9.5rem)_minmax(0,1fr)] gap-6 pb-12 last:pb-0 sm:grid-cols-[minmax(6.5rem,11rem)_minmax(0,1fr)] sm:gap-8"
          >
            <div className="flex min-w-0 flex-col items-end pt-1 text-right">
              <span
                className="max-w-full break-words uppercase leading-tight tracking-wide [overflow-wrap:anywhere]"
                style={{
                  color: "var(--timeline-number-color)",
                  fontFamily: "var(--timeline-number-font)",
                  fontWeight: "var(--timeline-number-weight)",
                  fontSize: "var(--timeline-number-size)",
                }}
              >
                {item.year}
              </span>
            </div>
            <div
              className="relative min-w-0 border-l pl-6 pb-2 sm:pl-8"
              style={{ borderColor: "var(--timeline-line-color)" }}
            >
              <span
                className="absolute -left-1.5 top-2 h-3 w-3 rounded-full border-2 bg-background"
                style={{ borderColor: "var(--timeline-dot-color)" }}
                aria-hidden
              />
              {item.title ? (
                <h3
                  style={{
                    color: "var(--timeline-title-color)",
                    fontFamily: "var(--timeline-title-font)",
                    fontWeight: "var(--timeline-title-weight)",
                    fontSize: "var(--timeline-title-size)",
                  }}
                >
                  {item.title}
                </h3>
              ) : null}
              <p
                className="mt-2 leading-[var(--leading-calm)]"
                style={{
                  color: "var(--timeline-text-color)",
                  fontFamily: "var(--timeline-text-font)",
                  fontWeight: "var(--timeline-text-weight)",
                  fontSize: "var(--timeline-text-size)",
                }}
              >
                {item.body}
              </p>
            </div>
          </ScrollReveal>
        ))}
      </ol>
    </>
  );
}
