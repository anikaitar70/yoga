export type EventCategory = "yoga" | "healing" | "just-art-life" | "retreats-and-tours";

export interface Event {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  location: string;
  price: string;
  description: string;
  category: EventCategory;
}

/** @deprecated Use `Event` — kept for gradual migration */
export type EventItem = Event;
