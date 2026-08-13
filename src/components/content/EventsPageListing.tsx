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
import type { EventsPageEventItem } from "@/lib/events-page-listing";
import { cn } from "@/lib/utils";

const INITIAL_VISIBLE_COUNT = 6;

type EventsPageListingProps = {
  specialEvents: EventsPageEventItem[];
  regularClasses: EventsPageEventItem[];
  locale: Locale;
  localeContent?: unknown;
  specialEventsInitialCount?: number;
  regularClassesInitialCount?: number;
  className?: string;
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
}: EventsPageListingProps) {
  const totalCount = specialEvents.length + regularClasses.length;

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
    <div className={cn("space-y-16 lg:space-y-20", className)}>
      {specialEvents.length > 0 ? (
        <ExpandableEventGroup
          title={uiMessage(locale, "specialEvents", localeContent)}
          titleId="events-page-special-heading"
          events={specialEvents}
          locale={locale}
          localeContent={localeContent}
          variant="special"
          initialVisibleCount={specialEventsInitialCount}
          expandLabel={uiMessage(locale, "expandEvents", localeContent)}
          showLessLabel={uiMessage(locale, "showLessEvents", localeContent)}
          expandAriaLabel={uiMessage(locale, "expandSpecialEventsAria", localeContent)}
          collapseAriaLabel={uiMessage(locale, "collapseSpecialEventsAria", localeContent)}
        />
      ) : null}

      {regularClasses.length > 0 ? (
        <ExpandableEventGroup
          title={uiMessage(locale, "regularClasses", localeContent)}
          titleId="events-page-regular-classes-heading"
          events={regularClasses}
          locale={locale}
          localeContent={localeContent}
          variant="regular"
          initialVisibleCount={regularClassesInitialCount}
          expandLabel={uiMessage(locale, "expandEvents", localeContent)}
          showLessLabel={uiMessage(locale, "showLessEvents", localeContent)}
          expandAriaLabel={uiMessage(locale, "expandRegularClassesAria", localeContent)}
          collapseAriaLabel={uiMessage(locale, "collapseRegularClassesAria", localeContent)}
        />
      ) : null}
    </div>
  );
}
