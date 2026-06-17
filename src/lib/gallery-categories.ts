export const GALLERY_CATEGORIES = [
  "ART",
  "YOGA_NIDRA",
  "EVENTS",
  "RETREATS",
  "HEALING",
  "JAPAN_EVENTS",
] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export function isGalleryCategory(value: string): value is GalleryCategory {
  return (GALLERY_CATEGORIES as readonly string[]).includes(value);
}

export const GALLERY_CATEGORY_LABELS: Record<GalleryCategory, string> = {
  ART: "Art & creative life",
  YOGA_NIDRA: "Yoga Nidra",
  EVENTS: "Events",
  RETREATS: "Retreats & tours",
  HEALING: "Healing",
  JAPAN_EVENTS: "Japan events",
};

/** Default collections mapped from original source folders. */
export const DEFAULT_GALLERY_COLLECTIONS = [
  {
    slug: "art",
    title: "Art & creative life",
    description: "Art, colour, and mindful creativity at Nirvana Yoga.",
    category: "ART" as GalleryCategory,
    sortOrder: 0,
    sourceFolderNames: ["art"],
  },
  {
    slug: "yoga-nidra",
    title: "Yoga Nidra",
    description: "Moments from Yoga Nidra teacher training — rest, presence, and deep relaxation.",
    category: "YOGA_NIDRA" as GalleryCategory,
    sortOrder: 1,
    sourceFolderNames: ["yoga nidra", "YogaNidra teachers training"],
  },
  {
    slug: "japan-events",
    title: "Embassy of India in Japan",
    description: "Cultural gatherings with the Embassy of India in Japan.",
    category: "JAPAN_EVENTS" as GalleryCategory,
    sortOrder: 2,
    sourceFolderNames: ["indian embassy at japan"],
  },
] as const;

export type DefaultGalleryCollection = (typeof DEFAULT_GALLERY_COLLECTIONS)[number];

export function collectionSlugForCategory(category: GalleryCategory): string | undefined {
  return DEFAULT_GALLERY_COLLECTIONS.find((c) => c.category === category)?.slug;
}

export function categoryForCollectionSlug(slug: string): GalleryCategory | undefined {
  return DEFAULT_GALLERY_COLLECTIONS.find((c) => c.slug === slug)?.category;
}
