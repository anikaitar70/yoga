import type { Event } from "@/content/types";

/** Split events for the main Events page without changing sort order within each group. */
export function partitionEventsForEventsPage(events: Event[]): {
  specialEvents: Event[];
  normalEvents: Event[];
} {
  const specialEvents: Event[] = [];
  const normalEvents: Event[] = [];

  for (const event of events) {
    if (event.isSpecialEvent) {
      specialEvents.push(event);
    } else {
      normalEvents.push(event);
    }
  }

  return { specialEvents, normalEvents };
}
