import type { EventDetailConfig } from "@/lib/event-detail";

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
  imageAlt?: string;
  isFeatured?: boolean;
  /** HTTPS URL for the externally hosted event page. */
  externalUrl?: string;
  /** CMS-configured Read More panel; null/undefined = legacy card only. */
  eventDetail?: EventDetailConfig | null;
}

/** @deprecated Use `Event` — kept for gradual migration */
export type EventItem = Event;
