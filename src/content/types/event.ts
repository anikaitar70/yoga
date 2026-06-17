export type EventCategory =
  | "yoga"
  | "healing"
  | "just-art-life"
  | "retreats-and-tours"
  | "retreat"
  | "workshop"
  | "teacher-training"
  | "philosophy"
  | "yoga-nidra";

export interface Event {
  id: string;
  slug: string;
  title: string;
  date: string;
  endDate?: string;
  location: string;
  price: string;
  description: string;
  category: EventCategory;
  imageUrl?: string;
  isFeatured?: boolean;
}

/** @deprecated Use `Event` — kept for gradual migration */
export type EventItem = Event;
