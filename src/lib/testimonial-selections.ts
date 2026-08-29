import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/i18n/server";
import { resolveContent } from "@/content/utils";
import { mapTestimonialRecord } from "@/lib/testimonial-map";
import { localizeTestimonials } from "@/lib/i18n/resolve";

async function fetchSelectedTestimonials(testimonialIds: string[]) {
  if (testimonialIds.length === 0) return [];
  const records = await prisma.testimonial.findMany({
    where: { id: { in: testimonialIds }, status: "APPROVED" },
  });
  const byId = new Map(records.map((r) => [r.id, r]));
  const ordered = testimonialIds.map((id) => byId.get(id)).filter(Boolean) as typeof records;
  const [resolved, locale] = await Promise.all([
    resolveContent(ordered.map(mapTestimonialRecord)),
    getLocale(),
  ]);
  return localizeTestimonials(resolved as never, locale);
}

export async function fetchHomepageTestimonialsFallback() {
  try {
    const selections = await prisma.homepageTestimonial.findMany({
      orderBy: { sortOrder: "asc" },
      select: { testimonialId: true },
    });
    if (selections.length > 0) {
      const ids = selections.map((s) => s.testimonialId);
      const selected = await fetchSelectedTestimonials(ids);
      if (selected.length > 0) return selected;
    }
  } catch {
    // Table may not exist yet (pending migration) — fall through to global
  }
  // Fallback to global approved set
  const records = await prisma.testimonial.findMany({
    where: { status: "APPROVED" },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
  });
  const [resolved, locale] = await Promise.all([
    resolveContent(records.map(mapTestimonialRecord)),
    getLocale(),
  ]);
  return localizeTestimonials(resolved as never, locale);
}

export async function fetchProgramPageTestimonialsFallback(pageType: string) {
  try {
    const selections = await prisma.programPageTestimonial.findMany({
      where: { pageType: pageType as never },
      orderBy: { sortOrder: "asc" },
      select: { testimonialId: true },
    });
    if (selections.length > 0) {
      const ids = selections.map((s) => s.testimonialId);
      const selected = await fetchSelectedTestimonials(ids);
      if (selected.length > 0) return selected;
    }
  } catch {
    // Table may not exist yet
  }
  return [];
}

export async function fetchSpecialEventTestimonialsFallback(eventId: string) {
  try {
    const selections = await prisma.specialEventTestimonial.findMany({
      where: { eventId },
      orderBy: { sortOrder: "asc" },
      select: { testimonialId: true },
    });
    if (selections.length > 0) {
      const ids = selections.map((s) => s.testimonialId);
      const selected = await fetchSelectedTestimonials(ids);
      if (selected.length > 0) return selected;
    }
  } catch {
    // Table may not exist yet (pending migration) — treat as no selections
  }
  return [];
}
