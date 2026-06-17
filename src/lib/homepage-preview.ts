import type { HeroContent } from "@/content/types";
import type { GalleryCollage, GalleryItem } from "@/content/types/gallery";
import type { AdminGalleryCollage, AdminGalleryItem, AdminHero } from "@/lib/admin-types";
import type { CollageLayout } from "@/lib/collage-layouts";
import type { GalleryCategory } from "@/lib/gallery-categories";

export function adminGalleryItemToGalleryItem(item: AdminGalleryItem): GalleryItem {
  return {
    id: item.id,
    src: item.src,
    alt: item.alt,
    title: item.title ?? undefined,
    description: item.description ?? undefined,
    category: item.category as GalleryCategory | undefined,
    collectionId: item.collectionId ?? undefined,
    collectionSlug: item.collectionSlug ?? undefined,
    aspectClass: item.aspectClass ?? undefined,
    featuredOnHomepage: item.featuredOnHomepage,
  };
}

export function buildCollageFromAdmin(
  collage: AdminGalleryCollage,
  gallery: AdminGalleryItem[],
): GalleryCollage {
  const items = collage.imageIds
    .map((id) => gallery.find((item) => item.id === id))
    .filter((item): item is AdminGalleryItem => Boolean(item))
    .map(adminGalleryItemToGalleryItem);

  return {
    id: collage.id,
    name: collage.name,
    slug: collage.slug,
    layout: collage.layout as CollageLayout,
    category: collage.category as GalleryCategory,
    collectionId: collage.collectionId ?? undefined,
    items,
  };
}

export function adminHeroToHeroContent(
  hero: AdminHero,
  context: {
    collages: AdminGalleryCollage[];
    gallery: AdminGalleryItem[];
  },
): HeroContent {
  const mediaMode = hero.mediaMode ?? "SINGLE";

  let collage: GalleryCollage | null = null;
  if (mediaMode === "COLLAGE" && hero.collageId) {
    const adminCollage = context.collages.find((entry) => entry.id === hero.collageId);
    if (adminCollage) {
      collage = buildCollageFromAdmin(adminCollage, context.gallery);
    }
  }

  let featuredCollectionItems: GalleryItem[] | undefined;
  if (mediaMode === "FEATURED_COLLECTION" && hero.featuredCollectionId) {
    featuredCollectionItems = context.gallery
      .filter((item) => item.collectionId === hero.featuredCollectionId)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map(adminGalleryItemToGalleryItem);
  }

  return {
    title: hero.title,
    subtitle: hero.subtitle,
    primaryCta: { label: hero.primaryCtaLabel, href: hero.primaryCtaHref },
    secondaryCta: { label: hero.secondaryCtaLabel, href: hero.secondaryCtaHref },
    imageSrc: hero.imageSrc,
    imageAlt: hero.imageAlt,
    mediaMode,
    rotatingImages: hero.rotatingImages,
    collage,
    featuredCollectionItems,
  };
}

/** Featured homepage gallery items for preview — includes unpublished with draft flag. */
export function previewFeaturedGalleryItems(gallery: AdminGalleryItem[]): {
  items: GalleryItem[];
  draftCount: number;
} {
  const featured = gallery
    .filter((item) => item.featuredOnHomepage)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const draftCount = featured.filter((item) => item.isPublished === false).length;

  return {
    items: featured.map(adminGalleryItemToGalleryItem),
    draftCount,
  };
}
