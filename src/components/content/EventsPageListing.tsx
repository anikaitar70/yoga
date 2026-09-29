"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EventsPageEventRow } from "@/components/content/EventsPageEventRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Locale } from "@/lib/i18n/locale";
import { uiMessage } from "@/lib/i18n/resolve";
import { localizedPath } from "@/lib/i18n/paths";
import { sortEventsPageItems, type EventsPageEventItem, type EventsPageSortKey } from "@/lib/events-page-listing";
import type { DesignEventCategoryColors } from "@/lib/design-settings";
import { cn } from "@/lib/utils";

const INITIAL_VISIBLE_COUNT = 6;

const SORT_OPTIONS: { value: EventsPageSortKey; label: string }[] = [
  { value: "default", label: "Featured order" },
  { value: "earliest", label: "Earliest first" },
  { value: "latest", label: "Latest first" },
  { value: "type", label: "By event type" },
  { value: "recurring", label: "Recurring first" },
];

type EventsPageListingProps = {
  specialEvents: EventsPageEventItem[];
  regularClasses: EventsPageEventItem[];
  locale: Locale;
  localeContent?: unknown;
  specialEventsInitialCount?: number;
  regularClassesInitialCount?: number;
  className?: string;
  eventCategoryColors?: DesignEventCategoryColors;
};

type ExpandableEventGroupProps = {
  title: string;
  titleId: string;
  events: EventsPageEventItem[];
  locale: Locale;
  localeContent?: unknown;
  variant: "special" | "regular";
  initialVisibleCount: number;
  expandLabel: string;
  showLessLabel: string;
  expandAriaLabel: string;
  collapseAriaLabel: string;
  eventCategoryColors?: DesignEventCategoryColors;
};

function ExpandableEventGroup({
  title,
  titleId,
  events,
  locale,
  localeContent,
  variant,
  initialVisibleCount,
  expandLabel,
  showLessLabel,
  expandAriaLabel,
  collapseAriaLabel,
  eventCategoryColors,
}: ExpandableEventGroupProps) {
  const [expanded, setExpanded] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const canExpand = events.length > initialVisibleCount;
  const visibleEvents = expanded ? events : events.slice(0, initialVisibleCount);

  return (
    <section aria-labelledby={titleId} className="space-y-8">
      <SectionHeading title={title} titleId={titleId} />
      <div className="space-y-6 lg:space-y-8">
        {visibleEvents.map((event, index) => {
          const isNewlyRevealed = expanded && index >= initialVisibleCount;
          const row = (
            <EventsPageEventRow
              event={event}
              locale={locale}
              localeContent={localeContent}
              variant={variant}
              eventCategoryColors={eventCategoryColors}
            />
          );

          if (!isNewlyRevealed || prefersReducedMotion) {
            return (
              <div key={event.id} className="min-w-0">
                {row}
              </div>
            );
          }

          return (
            <motion.div
              key={event.id}
              className="min-w-0"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {row}
            </motion.div>
          );
        })}
      </div>

      {canExpand ? (
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setExpanded((current) => !current)}
            aria-expanded={expanded}
            aria-label={expanded ? collapseAriaLabel : expandAriaLabel}
          >
            {expanded ? showLessLabel : expandLabel}
          </Button>
        </div>
      ) : null}
    </section>
  );
}

export function EventsPageListing({
  specialEvents,
  regularClasses,
  locale,
  localeContent,
  specialEventsInitialCount = INITIAL_VISIBLE_COUNT,
  regularClassesInitialCount = INITIAL_VISIBLE_COUNT,
  className,
  eventCategoryColors,
}: EventsPageListingProps) {
  const [sortKey, setSortKey] = useState<EventsPageSortKey>("default");
  const totalCount = specialEvents.length + regularClasses.length;
  const sortedSpecialEvents = sortEventsPageItems(specialEvents, sortKey);
  const sortedRegularClasses = sortEventsPageItems(regularClasses, sortKey);

  if (totalCount === 0) {
    return (
      <EmptyState
        title={uiMessage(locale, "noUpcomingEvents", localeContent)}
        description={uiMessage(locale, "noUpcomingEventsDesc", localeContent)}
        actionLabel={uiMessage(locale, "contactStudio", localeContent)}
        actionHref={localizedPath("/contact", locale)}
      />
    );
  }

  return (
    <div className={cn("space-y-8", className)}>
      <div className="flex justify-end">
        <label className="flex items-center gap-2 text-sm text-muted">
          {locale === "ja" ? "並び替え" : "Sort by"}
          <select
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as EventsPageSortKey)}
            className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-16 lg:space-y-20">
        {sortedSpecialEvents.length > 0 ? (
          <ExpandableEventGroup
            title={uiMessage(locale, "specialEvents", localeContent)}
            titleId="events-page-special-heading"
            events={sortedSpecialEvents}
            locale={locale}
            localeContent={localeContent}
            variant="special"
            initialVisibleCount={specialEventsInitialCount}
            expandLabel={uiMessage(locale, "expandEvents", localeContent)}
            showLessLabel={uiMessage(locale, "showLessEvents", localeContent)}
            expandAriaLabel={uiMessage(locale, "expandSpecialEventsAria", localeContent)}
            collapseAriaLabel={uiMessage(locale, "collapseSpecialEventsAria", localeContent)}
            eventCategoryColors={eventCategoryColors}
          />
        ) : null}

        {sortedRegularClasses.length > 0 ? (
          <ExpandableEventGroup
            title={uiMessage(locale, "regularClasses", localeContent)}
            titleId="events-page-regular-classes-heading"
            events={sortedRegularClasses}
            locale={locale}
            localeContent={localeContent}
            variant="regular"
            initialVisibleCount={regularClassesInitialCount}
            expandLabel={uiMessage(locale, "expandEvents", localeContent)}
            showLessLabel={uiMessage(locale, "showLessEvents", localeContent)}
            expandAriaLabel={uiMessage(locale, "expandRegularClassesAria", localeContent)}
            collapseAriaLabel={uiMessage(locale, "collapseRegularClassesAria", localeContent)}
            eventCategoryColors={eventCategoryColors}
          />
        ) : null}
      </div>
    </div>
  );
}
