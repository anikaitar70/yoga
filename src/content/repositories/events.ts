import { cache } from "react";
import type { EventCategory as PrismaEventCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { Event } from "@/content/types";
import { resolveContent } from "@/content/utils";
import {
  buildEventWhere,
  categoriesForPageSlug,
  mapPrismaEvent,
  type EventQueryOptions,
} from "@/lib/event-map";
import type { EventsSectionPayload } from "@/lib/page-section-types";
import { getLocale } from "@/lib/i18n/server";
import { localizeEvent, localizeEvents } from "@/lib/i18n/resolve";

async function queryEvents(options: EventQueryOptions): Promise<Event[]> {
  const limit = options.limit;
  const [events, locale] = await Promise.all([
    prisma.event.findMany({
      where: buildEventWhere(options),
      orderBy: options.orderBy ?? { startsAt: "asc" },
      ...(limit ? { take: limit } : {}),
    }),
    getLocale(),
  ]);
  return localizeEvents(events.map(mapPrismaEvent), locale);
}

export const fetchEvents = cache(async function fetchEvents(): Promise<Event[]> {
  return resolveContent(await queryEvents({}));
});

export const fetchEventsByCategory = cache(async function fetchEventsByCategory(
  categorySlug: string,
): Promise<Event[]> {
  return resolveContent(await queryEvents({ categorySlug }));
});

export const fetchFeaturedEvents = cache(async function fetchFeaturedEvents(
  limit = 6,
): Promise<Event[]> {
  return resolveContent(await queryEvents({ featured: true, limit }));
});

export const fetchUpcomingEvents = cache(async function fetchUpcomingEvents(
  limit = 6,
): Promise<Event[]> {
  return resolveContent(await queryEvents({ upcoming: true, limit }));
});

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
  return localizeEvent(mapPrismaEvent(event), locale);
}

export async function fetchEventById(id: string): Promise<Event | undefined> {
  const [event, locale] = await Promise.all([
    prisma.event.findUnique({ where: { id } }),
    getLocale(),
  ]);
  if (!event || !event.published) {
    return undefined;
  }
  return localizeEvent(mapPrismaEvent(event), locale);
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
