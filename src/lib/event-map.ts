import type { Event as PrismaEvent, EventCategory as PrismaEventCategory, Prisma } from "@prisma/client";
import type { Event, EventCategory } from "@/content/types";
import {
  eventCategoryToSlug,
  RETREAT_CATEGORIES,
  slugToEventCategory,
  YOGA_PAGE_CATEGORIES,
} from "@/lib/event-categories";
import { formatEventPriceDisplay } from "@/lib/format-event-price";
import { parseEventDetail } from "@/lib/event-detail";
import { parseEventJaLocale } from "@/lib/event-locale";
import { describeRecurrence, getNextOccurrence, type RecurrenceFrequency } from "@/lib/event-recurrence";

export const DEFAULT_EVENT_ORDER: Prisma.EventOrderByWithRelationInput[] = [
  { sortOrder: "asc" },
  { startsAt: "asc" },
];

type PrismaDateValue = Date | string;

function toIsoString(value: PrismaDateValue): string {
  return typeof value === "string" ? value : value.toISOString();
}

function toOptionalIsoString(value: PrismaDateValue | null | undefined): string | undefined {
  if (value == null) return undefined;
  return toIsoString(value);
}

function toOptionalDate(value: PrismaDateValue | null | undefined): Date | null {
  if (value == null) return null;
  return typeof value === "string" ? new Date(value) : value;
}

/** Prisma row or JSON-deserialized cache entry from unstable_cache. */
export type PrismaEventRecord = Omit<
  PrismaEvent,
  "startsAt" | "endsAt" | "recurrenceEndDate" | "recurrencePauseStart" | "recurrencePauseEnd"
> & {
  startsAt: PrismaDateValue;
  endsAt?: PrismaDateValue | null;
  recurrenceEndDate?: PrismaDateValue | null;
  recurrencePauseStart?: PrismaDateValue | null;
  recurrencePauseEnd?: PrismaDateValue | null;
};

export function mapPrismaEvent(
  record: PrismaEventRecord,
  options?: { specialPageSectionCount?: number },
): Event {
  const slug = eventCategoryToSlug(record.category);
  const eventType = record.eventType ?? "ONE_TIME";
  const recurrenceFrequency = (record.recurrenceFrequency as RecurrenceFrequency | null) ?? null;

  let effectiveDate = toIsoString(record.startsAt);
  let recurrenceDescription: string | undefined;
  if (eventType === "RECURRING" && recurrenceFrequency) {
    const recurrenceInput = {
      startsAt: typeof record.startsAt === "string" ? new Date(record.startsAt) : record.startsAt,
      recurrenceFrequency,
      recurrenceEndDate: toOptionalDate(record.recurrenceEndDate),
      recurrencePauseStart: toOptionalDate(record.recurrencePauseStart),
      recurrencePauseEnd: toOptionalDate(record.recurrencePauseEnd),
      recurrenceDaysOfWeek: record.recurrenceDaysOfWeek ?? null,
    };
    const next = getNextOccurrence(recurrenceInput, new Date());
    if (next) effectiveDate = next.toISOString();
    recurrenceDescription = describeRecurrence(recurrenceInput) ?? undefined;
  }

  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    date: effectiveDate,
    endDate: toOptionalIsoString(record.endsAt),
    eventType,
    recurrenceFrequency: recurrenceFrequency ?? undefined,
    recurrenceEndDate: toOptionalIsoString(record.recurrenceEndDate),
    recurrencePauseStart: toOptionalIsoString(record.recurrencePauseStart),
    recurrencePauseEnd: toOptionalIsoString(record.recurrencePauseEnd),
    recurrenceDaysOfWeek: record.recurrenceDaysOfWeek?.length ? record.recurrenceDaysOfWeek : undefined,
    recurrenceDescription,
    recurrenceAnchorDate: eventType === "RECURRING" ? toIsoString(record.startsAt) : undefined,
    location: record.location,
    price: formatEventPriceDisplay(record.price) ?? "",
    description: record.description,
    category: slug as EventCategory,
    imageUrl: record.imageUrl ?? undefined,
    imageAlt: record.imageAlt ?? record.title,
    heroImageUrl: (record as unknown as { heroImageUrl?: string | null }).heroImageUrl ?? undefined,
    heroImageAlt: (record as unknown as { heroImageAlt?: string | null }).heroImageAlt ?? undefined,
    isFeatured: record.isFeatured,
    sortOrder: record.sortOrder,
    externalUrl: record.externalUrl ?? undefined,
    externalLinkLabel: record.externalLinkLabel ?? undefined,
    specialEventCtaLabel: record.specialEventCtaLabel ?? undefined,
    specialEventCtaUrl: record.specialEventCtaUrl ?? undefined,
    eventDetail: parseEventDetail(record.eventDetail),
    seoTitle: record.seoTitle,
    metaDescription: record.metaDescription,
    ogImageUrl: record.ogImageUrl,
    canonicalUrlOverride: record.canonicalUrlOverride,
    focusKeywords: record.focusKeywords ?? [],
    jaTranslationStatus: record.jaTranslationStatus,
    jaLocale: parseEventJaLocale(record.jaLocale),
    isSpecialEvent: record.isSpecialEvent,
    specialEventTocMode: record.specialEventTocMode,
    specialPageSectionCount: options?.specialPageSectionCount,
  };
}

export type EventQueryOptions = {
  categories?: PrismaEventCategory[];
  categorySlug?: string;
  featured?: boolean;
  published?: boolean;
  upcoming?: boolean;
  eventKind?: "all" | "sessions" | "retreats";
  limit?: number;
  orderBy?: Prisma.EventOrderByWithRelationInput | Prisma.EventOrderByWithRelationInput[];
};

export function buildEventWhere(options: EventQueryOptions): Prisma.EventWhereInput {
  const where: Prisma.EventWhereInput = {
    published: options.published ?? true,
  };

  if (options.featured) {
    where.isFeatured = true;
  }

  if (options.upcoming) {
    // A RECURRING event's `startsAt` is just its original anchor date and may be in the past
    // even though it still has future occurrences, so it must not be excluded by this filter.
    where.OR = [
      { startsAt: { gte: new Date() } },
      {
        eventType: "RECURRING",
        OR: [{ recurrenceEndDate: null }, { recurrenceEndDate: { gte: new Date() } }],
      },
    ];
  }

  if (options.eventKind === "retreats") {
    where.category = { in: [...RETREAT_CATEGORIES] };
  } else if (options.categories?.length) {
    where.category = { in: options.categories };
  } else if (options.categorySlug) {
    const prismaCategories = categoriesForPageSlug(options.categorySlug);
    if (prismaCategories.length === 1) {
      where.category = prismaCategories[0];
    } else if (prismaCategories.length > 1) {
      where.category = { in: prismaCategories };
    }
  } else if (options.eventKind === "sessions") {
    where.category = { notIn: [...RETREAT_CATEGORIES] };
  }

  return where;
}

/** Map public page / URL slug to Prisma categories shown on that page. */
export function categoriesForPageSlug(slug: string): PrismaEventCategory[] {
  switch (slug) {
    case "yoga":
      return [...YOGA_PAGE_CATEGORIES];
    case "healing":
      return ["HEALING"];
    case "just-art-life":
      return ["JUST_ART_LIFE"];
    case "retreats-and-tours":
    case "retreats":
      return [...RETREAT_CATEGORIES];
    case "workshop":
      return ["WORKSHOP"];
    case "teacher-training":
      return ["TEACHER_TRAINING"];
    case "philosophy":
      return ["PHILOSOPHY"];
    case "yoga-nidra":
      return ["YOGA_NIDRA"];
    default: {
      const single = slugToEventCategory(slug);
      return [single];
    }
  }
}

export function isRetreatCategory(category: EventCategory | PrismaEventCategory): boolean {
  const normalized = typeof category === "string" ? category.toUpperCase().replace(/-/g, "_") : category;
  return (RETREAT_CATEGORIES as readonly string[]).includes(normalized);
}
