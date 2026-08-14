import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { Event } from "@/content/types";
import { mapPrismaEvent } from "@/lib/event-map";
import {
  buildSpecialEventToc,
  eventHasSpecialPage,
  mapEventPageSection,
  parseSpecialEventTocOverride,
  specialEventPublicPath,
  type EventPageSectionRecord,
  type SpecialEventTocItem,
} from "@/lib/event-page-section";
import { localizeEventPageSections } from "@/lib/event-page-section-locale";
import { eventSlugLookupCandidates } from "@/lib/event-slug";
import { getLocale } from "@/lib/i18n/server";
import { localizeEvent } from "@/lib/i18n/resolve";

export type SpecialEventPageData = {
  event: Event;
  sections: EventPageSectionRecord[];
  toc: SpecialEventTocItem[];
  publicPath: string;
};

async function loadPublishedSections(eventId: string): Promise<EventPageSectionRecord[]> {
  const rows = await prisma.eventPageSection.findMany({
    where: { eventId, isPublished: true },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map(mapEventPageSection);
}

export const fetchSpecialEventBySlug = cache(async function fetchSpecialEventBySlug(
  rawSlug: string,
): Promise<SpecialEventPageData | undefined> {
  const locale = await getLocale();

  for (const slug of eventSlugLookupCandidates(rawSlug)) {
    const eventRow = await prisma.event.findFirst({
      where: { slug, published: true, isSpecialEvent: true },
      include: {
        pageSections: {
          where: { isPublished: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
    if (!eventRow) continue;

    const event = localizeEvent(
      mapPrismaEvent(eventRow, { specialPageSectionCount: eventRow.pageSections.length }),
      locale,
    );
    const sections = localizeEventPageSections(eventRow.pageSections.map(mapEventPageSection), locale);
    const toc = buildSpecialEventToc(
      sections,
      eventRow.specialEventTocMode,
      parseSpecialEventTocOverride(eventRow.specialEventTocOverride),
    );

    return {
      event,
      sections,
      toc,
      publicPath: specialEventPublicPath(event.slug),
    };
  }

  return undefined;
});

export async function fetchSpecialEventSectionsForAdmin(eventId: string): Promise<EventPageSectionRecord[]> {
  const rows = await prisma.eventPageSection.findMany({
    where: { eventId },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map(mapEventPageSection);
}

export async function countPublishedSpecialEventSections(eventId: string): Promise<number> {
  return prisma.eventPageSection.count({
    where: { eventId, isPublished: true },
  });
}

export { eventHasSpecialPage, specialEventPublicPath };
