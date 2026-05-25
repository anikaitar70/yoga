import type { Testimonial, TestimonialStatus } from "@/content/types";
import { resolveContent } from "@/content/utils";
import { prisma } from "@/lib/prisma";

function normalizeTestimonialStatus(status: string | null | undefined): TestimonialStatus {
  switch (status?.toUpperCase()) {
    case "APPROVED":
      return "approved";
    case "REJECTED":
      return "rejected";
    case "PENDING":
      return "pending";
    default:
      return "approved";
  }
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  const records = await prisma.testimonial.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
  });

  return resolveContent(
    records.map((item) => ({
      id: item.id,
      quote: item.quote,
      name: item.name,
      role: item.role,
      status: normalizeTestimonialStatus(item.status),
    })),
  );
}

export async function fetchAllTestimonials(): Promise<Testimonial[]> {
  const records = await prisma.testimonial.findMany({
    orderBy: { createdAt: "desc" },
  });

  return resolveContent(
    records.map((item) => ({
      id: item.id,
      quote: item.quote,
      name: item.name,
      role: item.role,
      status: normalizeTestimonialStatus(item.status),
    })),
  );
}
