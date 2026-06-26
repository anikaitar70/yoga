import type { Event } from "@/content/types";
import { EventCard } from "@/components/ui/EventCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { HorizontalScrollItem, HorizontalScrollRail } from "@/components/ui/HorizontalScrollRail";
import type { Locale } from "@/lib/i18n/locale";
import { uiMessage } from "@/lib/i18n/resolve";
import { localizedPath } from "@/lib/i18n/paths";
import { cn } from "@/lib/utils";

type EventListViewProps = {
  events: Event[];
  locale: Locale;
  localeContent?: unknown;
  className?: string;
};

/** Locale-aware event rail — safe to import from client components (admin preview). */
export function EventListView({ events, locale, localeContent, className }: EventListViewProps) {
  if (events.length === 0) {
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
    <HorizontalScrollRail
      variant="event"
      itemCount={events.length}
      as="div"
      className={className}
      aria-label={uiMessage(locale, "eventsAriaLabel", localeContent)}
    >
      {events.map((event) => (
        <HorizontalScrollItem key={event.id} variant="event" as="div">
          <EventCard event={event} locale={locale} localeContent={localeContent} className="h-full" />
        </HorizontalScrollItem>
      ))}
    </HorizontalScrollRail>
  );
}
