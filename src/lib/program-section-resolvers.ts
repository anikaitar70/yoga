import type {
  GalleryFallbackConfig,
  GalleryImageItem,
  GallerySectionPayload,
  SectionTestimonialItem,
  TestimonialsSectionPayload,
} from "@/lib/page-section-types";
import type { PageType } from "@/lib/page-section-types";
import type { Testimonial } from "@/content/types";
import { fetchTestimonials } from "@/content/repositories/testimonials";
import {
  fetchGalleryItemsByCategory,
  fetchGalleryItemsByCollection,
} from "@/content/repositories/gallery";
import type { GalleryCategory } from "@/lib/gallery-categories";

const GALLERY_COLLECTION_BY_PAGE: Partial<Record<PageType, string>> = {
  YOGA: "yoga-nidra",
  JUST_ART_LIFE: "art",
};

function sectionItemToTestimonial(item: SectionTestimonialItem, index: number): Testimonial {
  return {
    id: `section-item-${index}`,
    quote: item.quote?.trim() ?? "",
    name: item.name?.trim() ?? "",
    role: item.role?.trim() ?? "",
    imageUrl: item.imageUrl,
    imageAlt: item.imageAlt,
    status: "approved",
    displayStyle: item.imageUrl ? "handwritten" : "card",
    sourceType: item.imageUrl ? "image" : "text",
  };
}

export async function resolveSectionTestimonials(
  payload: TestimonialsSectionPayload | null,
): Promise<Testimonial[]> {
  const items = payload?.items ?? [];
  const withContent = items.filter(
    (item) => item.quote?.trim() || item.imageUrl?.trim() || item.name?.trim(),
  );
  if (withContent.length > 0) {
    return withContent.map(sectionItemToTestimonial);
  }

  return fetchTestimonials();
}

async function resolveInheritedGalleryImages(pageType: PageType): Promise<GalleryImageItem[]> {
  if (pageType === "HEALING") {
    const healingItems = await fetchGalleryItemsByCategory("HEALING");
    if (healingItems.length > 0) {
      return healingItems.slice(0, 12).map((item) => ({
        url: item.src,
        alt: item.alt,
        title: item.title,
      }));
    }
  }

  const slug = GALLERY_COLLECTION_BY_PAGE[pageType];
  if (!slug) return [];

  const items = await fetchGalleryItemsByCollection(slug);
  return items.slice(0, 12).map((item) => ({
    url: item.src,
    alt: item.alt,
    title: item.title,
  }));
}

async function resolveGalleryFallback(
  fallback: GalleryFallbackConfig | undefined,
  pageType: PageType,
): Promise<GalleryImageItem[]> {
  const mode = fallback?.mode ?? "inherit";

  if (mode === "none") {
    return [];
  }

  if (mode === "category" && fallback?.category) {
    const items = await fetchGalleryItemsByCategory(fallback.category as GalleryCategory);
    return items.slice(0, 12).map((item) => ({
      url: item.src,
      alt: item.alt,
      title: item.title,
    }));
  }

  if (mode === "collection" && fallback?.collectionSlug) {
    const items = await fetchGalleryItemsByCollection(fallback.collectionSlug);
    return items.slice(0, 12).map((item) => ({
      url: item.src,
      alt: item.alt,
      title: item.title,
    }));
  }

  return resolveInheritedGalleryImages(pageType);
}

export async function resolveSectionGalleryImages(
  payload: GallerySectionPayload | null,
  pageType: PageType,
): Promise<GalleryImageItem[]> {
  const images = payload?.images ?? [];
  if (images.length > 0) return images;

  return resolveGalleryFallback(payload?.fallback, pageType);
}
