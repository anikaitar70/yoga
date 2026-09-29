import type { TimelineItemPayload } from "@/lib/page-section-types";
import { cn } from "@/lib/utils";

type NumberedTimelineListProps = {
  items: TimelineItemPayload[];
  renderItem?: (item: TimelineItemPayload, index: number) => React.ReactNode;
  className?: string;
};

/** Shared numbered timeline rows — styling via `.timeline-styled` CSS variables. */
export function NumberedTimelineList({ items, renderItem, className }: NumberedTimelineListProps) {
  return (
    <div className={cn("space-y-12", className)}>
      {items.map((item, index) =>
        renderItem ? (
          renderItem(item, index)
        ) : (
          <article
            key={`${item.number}-${index}`}
            className={cn(
              "grid gap-5 sm:grid-cols-12 sm:items-start",
              index % 2 === 1 && "sm:text-right",
            )}
          >
            <div className="sm:col-span-2">
              <span
                className="timeline-number font-display leading-none"
                style={{
                  color: "var(--timeline-number-color)",
                  fontFamily: "var(--timeline-number-font)",
                  fontWeight: "var(--timeline-number-weight)",
                  fontSize: "var(--timeline-number-size)",
                }}
              >
                {item.number}
              </span>
            </div>
            <div className="sm:col-span-10 space-y-1">
              {item.title ? (
                <h3
                  className="timeline-title font-display leading-tight"
                  style={{
                    color: "var(--timeline-text-color)",
                    fontFamily: "var(--timeline-text-font)",
                  }}
                >
                  {item.title}
                </h3>
              ) : null}
              {item.subtitle ? (
                <p className="timeline-subtitle text-sm text-muted leading-[var(--leading-calm)]">
                  {item.subtitle}
                </p>
              ) : null}
              <p
                className="timeline-text leading-[var(--leading-calm)]"
                style={{
                  color: "var(--timeline-text-color)",
                  fontFamily: "var(--timeline-text-font)",
                  fontWeight: "var(--timeline-text-weight)",
                  fontSize: "var(--timeline-text-size)",
                }}
              >
                {item.text}
              </p>
            </div>
          </article>
        ),
      )}
    </div>
  );
}
