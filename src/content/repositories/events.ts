import { prisma } from "@/lib/prisma";
import type { Event, EventCategory } from "@/content/types";
import { resolveContent } from "@/content/utils";

function normalizeEventCategory(category?: string | null): EventCategory {
  const normalized = category?.toLowerCase().replace(/_/g, "-") ?? "yoga";
  if (normalized === "healing" || normalized === "just-art-life" || normalized === "retreats-and-tours") {
    return normalized;
  }
  return "yoga";
}

export async function fetchEvents(): Promise<Event[]> {
  const events = await prisma.event.findMany({
    where: { published: true },
    orderBy: { startsAt: "asc" },
  });
  return resolveContent(
    events.map((e) => ({
      id: e.id,
      title: e.title,
      date: e.startsAt.toISOString(),
      endDate: e.endsAt?.toISOString(),
      location: e.location,
      price: e.price?.toString() ?? "",
      description: e.description,
      category: normalizeEventCategory(e.category),
    }))
  );
}

export async function fetchEventsByCategory(category: string): Promise<Event[]> {
  const categoryMap: Record<string, string> = {
    yoga: "YOGA",
    healing: "HEALING",
    "just-art-life": "JUST_ART_LIFE",
    "retreats-and-tours": "RETREATS_AND_TOURS",
  };
  
  const prismaCategory = categoryMap[category];
  if (!prismaCategory) {
    return [];
  }

  const events = await prisma.event.findMany({
    where: { 
      published: true,
      category: prismaCategory as any,
    },
    orderBy: { startsAt: "asc" },
  });
  
  return resolveContent(
    events.map((e) => ({
      id: e.id,
      title: e.title,
      date: e.startsAt.toISOString(),
      endDate: e.endsAt?.toISOString(),
      location: e.location,
      price: e.price?.toString() ?? "",
      description: e.description,
      category: normalizeEventCategory(e.category),
    }))
  );
}

export async function fetchFeaturedEvents(limit = 2): Promise<Event[]> {
  const events = await prisma.event.findMany({
    where: { published: true, isFeatured: true },
    orderBy: { startsAt: "asc" },
    take: limit,
  });
  
  return resolveContent(
    events.map((e) => ({
      id: e.id,
      title: e.title,
      date: e.startsAt.toISOString(),
      endDate: e.endsAt?.toISOString(),
      location: e.location,
      price: e.price?.toString() ?? "",
      description: e.description,
      category: normalizeEventCategory(e.category),
    }))
  );
}

export async function fetchEventById(id: string): Promise<Event | undefined> {
  const event = await prisma.event.findUnique({
    where: { id },
  });
  
  if (!event || !event.published) {
    return undefined;
  }

  return {
    id: event.id,
    title: event.title,
    date: event.startsAt.toISOString(),
    endDate: event.endsAt?.toISOString(),
    location: event.location,
    price: event.price?.toString() ?? "",
    description: event.description,
    category: normalizeEventCategory(event.category),
  };
}
