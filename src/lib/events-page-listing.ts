import type { Event } from "@/content/types";
import type { Locale } from "@/lib/i18n/locale";
import { formatEventRange } from "@/lib/format";

export type EventsPageEventItem = Event & {
  dateLabel: string;
};

/** Split events for the main Events page without changing sort order within each group. */
export function partitionEventsForEventsPage(events: Event[]): {
  specialEvents: Event[];
  regularClasses: Event[];
} {
  const specialEvents: Event[] = [];
  const regularClasses: Event[] = [];

  for (const event of events) {
    if (event.isSpecialEvent) {
      specialEvents.push(event);
    } else {
      regularClasses.push(event);
    }
  }

  return { specialEvents, regularClasses };
}

export function toEventsPageEventItem(event: Event, locale: Locale): EventsPageEventItem {
  return {
    ...event,
    dateLabel: formatEventRange(event.date, event.endDate, locale),
  };
}

export function toEventsPageEventItems(events: Event[], locale: Locale): EventsPageEventItem[] {
  return events.map((event) => toEventsPageEventItem(event, locale));
}
