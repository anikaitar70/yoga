import type { Event as PrismaEvent, EventCategory as PrismaEventCategory, Prisma } from "@prisma/client";
import type { Event, EventCategory } from "@/content/types";
import {
  eventCategoryToSlug,
  RETREAT_CATEGORIES,
  slugToEventCategory,
  YOGA_PAGE_CATEGORIES,
} from "@/lib/event-categories";

export function mapPrismaEvent(record: PrismaEvent): Event {
  const slug = eventCategoryToSlug(record.category);
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    date: record.startsAt.toISOString(),
    endDate: record.endsAt?.toISOString(),
    location: record.location,
    price: record.price?.toString() ?? "",
    description: record.description,
    category: slug as EventCategory,
  imageUrl: record.imageUrl ?? undefined,
  imageAlt: record.imageAlt ?? record.title,
  isFeatured: record.isFeatured,
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
  orderBy?: Prisma.EventOrderByWithRelationInput;
};

export function buildEventWhere(options: EventQueryOptions): Prisma.EventWhereInput {
  const where: Prisma.EventWhereInput = {
    published: options.published ?? true,
  };

  if (options.featured) {
    where.isFeatured = true;
  }

  if (options.upcoming) {
    where.startsAt = { gte: new Date() };
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
