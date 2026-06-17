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

/** Carousel shows transcription cards only — skips image-only shells. */
export function testimonialForCarousel(testimonial: Testimonial): boolean {
  return Boolean(testimonialDisplayQuote(testimonial));
}

/** One card per message — keeps the richest OCR record when duplicates share an image. */
export function dedupeTestimonialsForCarousel(testimonials: Testimonial[]): Testimonial[] {
  const withQuote = testimonials.filter(testimonialForCarousel);
  const bestByImage = new Map<string, Testimonial>();

  for (const item of withQuote) {
    const imageKey = item.imageUrl?.trim();
    if (!imageKey) continue;

    const existing = bestByImage.get(imageKey);
    if (
      !existing ||
      testimonialDisplayQuote(item).length > testimonialDisplayQuote(existing).length
    ) {
      bestByImage.set(imageKey, item);
    }
  }

  const seenImages = new Set<string>();
  const seenNames = new Set<string>();
  const result: Testimonial[] = [];

  for (const item of withQuote) {
    const imageKey = item.imageUrl?.trim();
    if (imageKey) {
      if (bestByImage.get(imageKey)?.id !== item.id) continue;
      if (seenImages.has(imageKey)) continue;
      seenImages.add(imageKey);
    }

    const nameKey = item.name?.trim().toLowerCase();
    if (nameKey) {
      if (seenNames.has(nameKey)) continue;
      seenNames.add(nameKey);
    }

    result.push(item);
  }

  return result;
}
