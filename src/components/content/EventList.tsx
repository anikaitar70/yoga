import type { Event } from "@/content/types";
import { EventCard } from "@/components/ui/EventCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { HorizontalScrollItem, HorizontalScrollRail } from "@/components/ui/HorizontalScrollRail";
import { getLocale } from "@/lib/i18n/server";
import { loadSiteConfigRowForLocale } from "@/content/repositories/site-locale";
import { uiMessage } from "@/lib/i18n/resolve";
import { cn } from "@/lib/utils";

type EventListProps = {
  events: Event[];
  className?: string;
};

export async function EventList({ events, className }: EventListProps) {
  const locale = await getLocale();
  const localeContent = await loadSiteConfigRowForLocale();

  if (events.length === 0) {
    return (
      <EmptyState
        title={uiMessage(locale, "noUpcomingEvents", localeContent)}
        description={uiMessage(locale, "noUpcomingEventsDesc", localeContent)}
        actionLabel={uiMessage(locale, "contactStudio", localeContent)}
        actionHref={locale === "ja" ? "/ja/contact" : "/contact"}
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
          <EventCard event={event} className="h-full" />
        </HorizontalScrollItem>
      ))}
    </HorizontalScrollRail>
  );
}
