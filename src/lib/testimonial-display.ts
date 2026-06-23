import type { Testimonial } from "@/content/types";

export function testimonialDisplayQuote(testimonial: Testimonial): string {
  return testimonial.quote?.trim() || testimonial.extractedText?.trim() || "";
}

export function testimonialLocation(testimonial: Testimonial): string {
  return [testimonial.city, testimonial.country].filter(Boolean).join(", ");
}

export function testimonialAttribution(testimonial: Testimonial): {
  name: string;
  subtitle: string;
} {
  const location = testimonialLocation(testimonial);
  const role = testimonial.role?.trim() ?? "";
  const subtitle =
    role && location && !role.includes(location) ? `${role} · ${location}` : role || location;

  return {
    name: testimonial.name?.trim() ?? "",
    subtitle,
  };
}

export function testimonialHasImage(testimonial: Testimonial): boolean {
  return Boolean(testimonial.imageUrl?.trim());
}

export function testimonialIsRenderable(testimonial: Testimonial): boolean {
  return Boolean(testimonialDisplayQuote(testimonial) || testimonialHasImage(testimonial));
}

/** Approved testimonials for carousels — preserves order, skips only non-renderable rows. */
export function dedupeTestimonialsForCarousel(testimonials: Testimonial[]): Testimonial[] {
  const seenIds = new Set<string>();
  const result: Testimonial[] = [];

  for (const item of testimonials) {
    if (!testimonialIsRenderable(item)) continue;
    if (seenIds.has(item.id)) continue;
    seenIds.add(item.id);
    result.push(item);
  }

  return result;
}
