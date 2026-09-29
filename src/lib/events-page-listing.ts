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
  let dateLabel: string;
  if (event.eventType === "ON_REQUEST") {
    dateLabel = locale === "ja" ? "リクエストに応じて開催" : "Available by request";
  } else if (event.eventType === "RECURRING" && event.recurrenceDescription) {
    const nextLabel = formatEventRange(event.date, event.endDate, locale);
    dateLabel =
      locale === "ja"
        ? `${event.recurrenceDescription} ・ 次回: ${nextLabel}`
        : `${event.recurrenceDescription} · Next: ${nextLabel}`;
  } else {
    dateLabel = formatEventRange(event.date, event.endDate, locale);
  }

  return { ...event, dateLabel };
}

export function toEventsPageEventItems(events: Event[], locale: Locale): EventsPageEventItem[] {
  return events.map((event) => toEventsPageEventItem(event, locale));
}

export type EventsPageSortKey = "default" | "earliest" | "latest" | "type" | "recurring";

const EVENT_TYPE_ORDER: Record<NonNullable<Event["eventType"]>, number> = {
  ONE_TIME: 0,
  RECURRING: 1,
  ON_REQUEST: 2,
};

/** Sorts a copy of `events` for the /events page sort control. "default" preserves admin-configured order. */
export function sortEventsPageItems<T extends Event>(events: T[], sortKey: EventsPageSortKey): T[] {
  if (sortKey === "default") return events;

  const sorted = [...events];
  const byDateAsc = (a: T, b: T) => new Date(a.date).getTime() - new Date(b.date).getTime();

  switch (sortKey) {
    case "earliest":
      return sorted.sort(byDateAsc);
    case "latest":
      return sorted.sort((a, b) => byDateAsc(b, a));
    case "type":
      return sorted.sort((a, b) => {
        const typeDiff = EVENT_TYPE_ORDER[a.eventType ?? "ONE_TIME"] - EVENT_TYPE_ORDER[b.eventType ?? "ONE_TIME"];
        return typeDiff !== 0 ? typeDiff : byDateAsc(a, b);
      });
    case "recurring":
      return sorted.sort((a, b) => {
        const aRecurring = a.eventType === "RECURRING" ? 0 : 1;
        const bRecurring = b.eventType === "RECURRING" ? 0 : 1;
        return aRecurring !== bRecurring ? aRecurring - bRecurring : byDateAsc(a, b);
      });
    default:
      return sorted;
  }
}
