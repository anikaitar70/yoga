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

export type EventType = "ONE_TIME" | "RECURRING" | "ON_REQUEST";
export type RecurrenceFrequency = "WEEKLY" | "BIWEEKLY" | "MONTHLY";

export interface Event extends SeoFields {
  id: string;
  slug: string;
  title: string;
  /** For RECURRING events, this is the next upcoming occurrence (or the anchor date if recurrence has ended). */
  date: string;
  endDate?: string;
  eventType?: EventType;
  recurrenceFrequency?: RecurrenceFrequency;
  recurrenceEndDate?: string;
  recurrencePauseStart?: string;
  recurrencePauseEnd?: string;
  /** Weekly/biweekly only — which weekdays occurrences fall on (0=Sunday..6=Saturday). Empty = single weekday from the anchor date. */
  recurrenceDaysOfWeek?: number[];
  /** Human-readable recurrence text for badges/cards, e.g. "Every Monday". */
  recurrenceDescription?: string;
  /** Original startsAt anchor for a RECURRING event (used by the calendar to expand occurrences). */
  recurrenceAnchorDate?: string;
  location: string;
  price: string;
  description: string;
  category: EventCategory;
  imageUrl?: string;
  imageAlt?: string;
  /** Dedicated hero image for special event page (falls back to imageUrl). Shown at top of /events/special/[slug]. */
  heroImageUrl?: string;
  heroImageAlt?: string;
  isFeatured?: boolean;
  sortOrder?: number;
  /** HTTPS URL for the externally hosted event page. */
  externalUrl?: string;
  /** Custom label for the external-link button; defaults in UI when blank. */
  externalLinkLabel?: string;
  /** Primary CTA on the dedicated special event public page. */
  specialEventCtaLabel?: string;
  specialEventCtaUrl?: string;
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
