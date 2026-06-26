import type { Testimonial } from "@/content/types";
import { resolveContent } from "@/content/utils";
import { mapTestimonialRecord } from "@/lib/testimonial-map";
import { getLocale } from "@/lib/i18n/server";
import { localizeTestimonials } from "@/lib/i18n/resolve";
import { prisma } from "@/lib/prisma";

const testimonialOrder = [
  { featured: "desc" as const },
  { sortOrder: "asc" as const },
  { createdAt: "desc" as const },
];

export async function fetchTestimonials(): Promise<Testimonial[]> {
  const [records, locale] = await Promise.all([
    prisma.testimonial.findMany({
      where: { status: "APPROVED" },
      orderBy: testimonialOrder,
    }),
    getLocale(),
  ]);

  const testimonials = await resolveContent(records.map(mapTestimonialRecord));
  return localizeTestimonials(testimonials, locale);
}

export async function fetchFeaturedTestimonials(limit = 12): Promise<Testimonial[]> {
  const [records, locale] = await Promise.all([
    prisma.testimonial.findMany({
      where: { status: "APPROVED" },
      orderBy: testimonialOrder,
      take: limit,
    }),
    getLocale(),
  ]);

  const testimonials = await resolveContent(records.map(mapTestimonialRecord));
  return localizeTestimonials(testimonials, locale);
}

export async function fetchAllTestimonials(): Promise<Testimonial[]> {
  const records = await prisma.testimonial.findMany({
    orderBy: testimonialOrder,
  });

  return resolveContent(records.map(mapTestimonialRecord));
}
