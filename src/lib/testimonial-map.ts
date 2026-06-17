import type { Testimonial, TestimonialDisplayStyle, TestimonialSourceType, TestimonialStatus } from "@/content/types";
import type { AdminTestimonial } from "@/lib/admin-types";

export function normalizeTestimonialStatus(status: string | null | undefined): TestimonialStatus {
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

export function normalizeSourceType(value: string | null | undefined): TestimonialSourceType {
  switch (value?.toUpperCase()) {
    case "IMAGE":
      return "image";
    case "OCR":
      return "ocr";
    default:
      return "text";
  }
}

export function normalizeDisplayStyle(value: string | null | undefined): TestimonialDisplayStyle {
  return value?.toUpperCase() === "CARD" ? "card" : "handwritten";
}

export function mapTestimonialRecord(item: {
  id: string;
  quote: string;
  name: string;
  role: string;
  city: string | null;
  country: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  extractedText: string | null;
  sourceType: string;
  displayStyle: string;
  ocrConfidence: number | null;
  status: string;
  featured?: boolean;
  sortOrder?: number;
}): Testimonial {
  const quote = item.quote?.trim() || item.extractedText?.trim() || "";
  const locationRole = [item.city, item.country].filter(Boolean).join(", ");

  return {
    id: item.id,
    quote,
    name: item.name,
    role: item.role || locationRole,
    city: item.city ?? undefined,
    country: item.country ?? undefined,
    imageUrl: item.imageUrl ?? undefined,
    imageAlt: item.imageAlt ?? undefined,
    extractedText: item.extractedText ?? undefined,
    sourceType: normalizeSourceType(item.sourceType),
    displayStyle: normalizeDisplayStyle(item.displayStyle),
    ocrConfidence: item.ocrConfidence ?? undefined,
    status: normalizeTestimonialStatus(item.status),
    featured: item.featured ?? false,
    sortOrder: item.sortOrder ?? 0,
  };
}

export function mapAdminTestimonial(item: {
  id: string;
  quote: string;
  name: string;
  role: string;
  city: string | null;
  country: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  extractedText: string | null;
  sourceType: string;
  displayStyle: string;
  ocrConfidence: number | null;
  status: string;
  featured?: boolean;
  sortOrder?: number;
}): AdminTestimonial {
  const mapped = mapTestimonialRecord(item);
  return {
    id: mapped.id,
    quote: mapped.quote,
    name: mapped.name,
    role: mapped.role,
    city: mapped.city ?? null,
    country: mapped.country ?? null,
    imageUrl: mapped.imageUrl ?? null,
    imageAlt: mapped.imageAlt ?? null,
    extractedText: mapped.extractedText ?? null,
    sourceType: mapped.sourceType ?? "text",
    displayStyle: mapped.displayStyle ?? "handwritten",
    ocrConfidence: mapped.ocrConfidence ?? null,
    status: mapped.status,
    featured: mapped.featured ?? false,
    sortOrder: mapped.sortOrder ?? 0,
  };
}
