import type { EventDetailConfig } from "@/lib/event-detail";
import type { EventJaLocale } from "@/lib/event-locale";
import type { SeoFields } from "@/lib/seo/types";

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

export interface Event extends SeoFields {
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
  sortOrder?: number;
  /** HTTPS URL for the externally hosted event page. */
  externalUrl?: string;
  /** Custom label for the external-link button; defaults in UI when blank. */
  externalLinkLabel?: string;
  /** CMS-configured Read More panel; null/undefined = legacy card only. */
  eventDetail?: EventDetailConfig | null;
  /** Manual Japanese card copy from CMS when provided. */
  jaLocale?: EventJaLocale | null;
  /** Dedicated public page at /events/special/[slug] when configured. */
  isSpecialEvent?: boolean;
  specialEventTocMode?: "AUTOMATIC" | "CUSTOM";
  specialPageSectionCount?: number;
}

/** @deprecated Use `Event` — kept for gradual migration */
export type EventItem = Event;
