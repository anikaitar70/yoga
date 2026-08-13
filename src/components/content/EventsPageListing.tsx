"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Event } from "@/content/types";
import { EventCard } from "@/components/ui/EventCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Locale } from "@/lib/i18n/locale";
import { uiMessage } from "@/lib/i18n/resolve";
import { localizedPath } from "@/lib/i18n/paths";
import { cn } from "@/lib/utils";

const INITIAL_VISIBLE_COUNT = 6;

type EventsPageListingProps = {
  specialEvents: Event[];
  normalEvents: Event[];
  locale: Locale;
  localeContent?: unknown;
  className?: string;
};

type ExpandableEventGroupProps = {
  title: string;
  titleId: string;
  events: Event[];
  locale: Locale;
  localeContent?: unknown;
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
  expandLabel,
  showLessLabel,
  expandAriaLabel,
  collapseAriaLabel,
}: ExpandableEventGroupProps) {
  const [expanded, setExpanded] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const canExpand = events.length > INITIAL_VISIBLE_COUNT;
  const visibleEvents = expanded ? events : events.slice(0, INITIAL_VISIBLE_COUNT);

  return (
    <section aria-labelledby={titleId} className="space-y-8">
      <SectionHeading title={title} titleId={titleId} />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibleEvents.map((event, index) => {
          const isNewlyRevealed = expanded && index >= INITIAL_VISIBLE_COUNT;
          const card = (
            <EventCard event={event} locale={locale} localeContent={localeContent} className="h-full" />
          );

          if (!isNewlyRevealed || prefersReducedMotion) {
            return (
              <div key={event.id} className="min-w-0">
                {card}
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
              {card}
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
  normalEvents,
  locale,
  localeContent,
  className,
}: EventsPageListingProps) {
  const totalCount = specialEvents.length + normalEvents.length;

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
          expandLabel={uiMessage(locale, "expandEvents", localeContent)}
          showLessLabel={uiMessage(locale, "showLessEvents", localeContent)}
          expandAriaLabel={uiMessage(locale, "expandSpecialEventsAria", localeContent)}
          collapseAriaLabel={uiMessage(locale, "collapseSpecialEventsAria", localeContent)}
        />
      ) : null}

      {normalEvents.length > 0 ? (
        <ExpandableEventGroup
          title={uiMessage(locale, "normalEvents", localeContent)}
          titleId="events-page-normal-heading"
          events={normalEvents}
          locale={locale}
          localeContent={localeContent}
          expandLabel={uiMessage(locale, "expandEvents", localeContent)}
          showLessLabel={uiMessage(locale, "showLessEvents", localeContent)}
          expandAriaLabel={uiMessage(locale, "expandNormalEventsAria", localeContent)}
          collapseAriaLabel={uiMessage(locale, "collapseNormalEventsAria", localeContent)}
        />
      ) : null}
    </div>
  );
}
