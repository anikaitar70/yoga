import { unstable_cache } from "next/cache";
import type { EventCategory as PrismaEventCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { Event } from "@/content/types";
import { resolveContent } from "@/content/utils";
import {
  buildEventWhere,
  categoriesForPageSlug,
  DEFAULT_EVENT_ORDER,
  mapPrismaEvent,
  type EventQueryOptions,
} from "@/lib/event-map";
import type { EventsSectionPayload } from "@/lib/page-section-types";
import { getLocale } from "@/lib/i18n/server";
import { localizeEvent, localizeEvents } from "@/lib/i18n/resolve";
import { autoLocalizeEventsWithFallback, autoLocalizeEventWithFallback } from "@/lib/ja-auto";
import { EVENTS_CACHE_TAG } from "@/lib/revalidate-events";

type PublishedEventRow = Awaited<ReturnType<typeof loadPublishedEventRows>>[number];

async function loadPublishedEventRows(options: EventQueryOptions) {
  const limit = options.limit;
  return prisma.event.findMany({
    where: buildEventWhere(options),
    orderBy: options.orderBy ?? DEFAULT_EVENT_ORDER,
    include: {
      _count: {
        select: {
          pageSections: { where: { isPublished: true } },
        },
      },
    },
    ...(limit ? { take: limit } : {}),
  });
}

const getPublishedEventRowsCached = unstable_cache(
  async (optionsKey: string) => {
    const options = JSON.parse(optionsKey) as EventQueryOptions;
    return loadPublishedEventRows(options);
  },
  ["published-event-rows"],
  { tags: [EVENTS_CACHE_TAG] },
);

function cacheKeyForOptions(options: EventQueryOptions): string {
  return JSON.stringify(options);
}

async function queryEvents(options: EventQueryOptions): Promise<Event[]> {
  const [events, locale] = await Promise.all([
    getPublishedEventRowsCached(cacheKeyForOptions(options)),
    getLocale(),
  ]);
  const localized = localizeEvents(
    events.map((event: PublishedEventRow) =>
      mapPrismaEvent(event, { specialPageSectionCount: event._count.pageSections }),
    ),
    locale,
  );
  // Automatic JA fallback via free SMT/NMT when jaLocale missing — ensures Japanese site always shows Japanese
  if (locale === "ja") {
    return await autoLocalizeEventsWithFallback(localized, locale);
  }
  return localized;
}

export async function fetchEvents(): Promise<Event[]> {
  return resolveContent(await queryEvents({}));
}

export async function fetchEventsByCategory(categorySlug: string): Promise<Event[]> {
  return resolveContent(await queryEvents({ categorySlug }));
}

export async function fetchFeaturedEvents(limit = 6): Promise<Event[]> {
  return resolveContent(await queryEvents({ featured: true, limit }));
}

export async function fetchUpcomingEvents(limit = 6): Promise<Event[]> {
  return resolveContent(await queryEvents({ upcoming: true, limit }));
}

export async function fetchEventsForSection(payload: EventsSectionPayload | null): Promise<Event[]> {
  const eventKind = payload?.eventKind ?? "all";
  const limit = payload?.limit ?? 12;
  const categories = payload?.categories as PrismaEventCategory[] | undefined;

  return resolveContent(
    await queryEvents({
      eventKind,
      categories,
      limit,
    }),
  );
}

export async function fetchEventBySlug(slug: string): Promise<Event | undefined> {
  const [event, locale] = await Promise.all([
    prisma.event.findFirst({ where: { slug, published: true } }),
    getLocale(),
  ]);
  if (!event) return undefined;
  const localized = localizeEvent(mapPrismaEvent(event), locale);
  if (locale === "ja") return await autoLocalizeEventWithFallback(localized, locale);
  return localized;
}

export async function fetchEventById(id: string): Promise<Event | undefined> {
  const [event, locale] = await Promise.all([
    prisma.event.findUnique({ where: { id } }),
    getLocale(),
  ]);
  if (!event || !event.published) {
    return undefined;
  }
  const localized = localizeEvent(mapPrismaEvent(event), locale);
  if (locale === "ja") return await autoLocalizeEventWithFallback(localized, locale);
  return localized;
}

/** Events for a program page type (yoga, healing, just-art-life). */
export async function fetchEventsForPage(pageSlug: string, limit = 12): Promise<Event[]> {
  return resolveContent(
    await queryEvents({
      categorySlug: pageSlug,
      limit,
    }),
  );
}

export { categoriesForPageSlug };
