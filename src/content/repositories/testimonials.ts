import type { Testimonial } from "@/content/types";
import { resolveContent } from "@/content/utils";
import { mapTestimonialRecord } from "@/lib/testimonial-map";
import { prisma } from "@/lib/prisma";

const testimonialOrder = [
  { featured: "desc" as const },
  { sortOrder: "asc" as const },
  { createdAt: "desc" as const },
];

export async function fetchTestimonials(): Promise<Testimonial[]> {
  const records = await prisma.testimonial.findMany({
    where: { status: "APPROVED" },
    orderBy: testimonialOrder,
  });

  return resolveContent(records.map(mapTestimonialRecord));
}

export async function fetchFeaturedTestimonials(limit = 12): Promise<Testimonial[]> {
  const records = await prisma.testimonial.findMany({
    where: { status: "APPROVED" },
    orderBy: testimonialOrder,
    take: limit,
  });

  return resolveContent(records.map(mapTestimonialRecord));
}

export async function fetchAllTestimonials(): Promise<Testimonial[]> {
  const records = await prisma.testimonial.findMany({
    orderBy: testimonialOrder,
  });

  return resolveContent(records.map(mapTestimonialRecord));
}
