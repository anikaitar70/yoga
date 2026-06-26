import { cache } from "react";
import { unstable_cache } from "next/cache";
import type { GalleryCollage, GalleryCollection, GalleryItem } from "@/content/types";
import { resolveContent } from "@/content/utils";
import {
  DEFAULT_GALLERY_COLLECTIONS,
  type GalleryCategory,
} from "@/lib/gallery-categories";
import { galleryImageOrderBy, isGallerySchemaReady } from "@/lib/gallery-schema";
import { prisma } from "@/lib/prisma";

const fallbackGalleryItems: GalleryItem[] = [
  {
    id: "g1",
    src: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
    alt: "Peaceful yoga space with plants",
    aspectClass: "aspect-[4/5]",
    category: "ART",
  },
  {
    id: "g2",
    src: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
    alt: "Hands in meditation gesture",
    aspectClass: "aspect-square",
    category: "YOGA_NIDRA",
  },
  {
    id: "g3",
    src: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80",
    alt: "Yoga mat and props in soft light",
    aspectClass: "aspect-[3/4]",
    category: "HEALING",
  },
];

function collectionSlugForCategory(category: GalleryCategory): string {
  return DEFAULT_GALLERY_COLLECTIONS.find((entry) => entry.category === category)?.slug ?? "art";
}

function mapGalleryRecord(
  item: {
    id: string;
    url: string;
    thumbnailUrl?: string | null;
    mediumUrl?: string | null;
    altText: string | null;
    title: string | null;
    description: string | null;
    category: GalleryCategory;
    collectionId: string | null;
    featuredOnHomepage: boolean;
    collection?: { slug: string } | null;
  },
): GalleryItem {
  return {
    id: item.id,
    src: item.thumbnailUrl ?? item.mediumUrl ?? item.url,
    fullSrc: item.url,
    mediumSrc: item.mediumUrl ?? undefined,
    thumbnailSrc: item.thumbnailUrl ?? undefined,
    alt: item.altText ?? item.title ?? "",
    title: item.title ?? undefined,
    description: item.description ?? undefined,
    category: item.category,
    collectionId: item.collectionId ?? undefined,
    collectionSlug: item.collection?.slug ?? collectionSlugForCategory(item.category),
    featuredOnHomepage: item.featuredOnHomepage,
  };
}

async function fetchGalleryCollectionsByCategory(): Promise<GalleryCollection[]> {
  const ready = await isGallerySchemaReady();
  const images = await prisma.galleryImage.findMany({
    where: { isPublished: true },
    orderBy: [...galleryImageOrderBy(ready)],
  });

  return DEFAULT_GALLERY_COLLECTIONS.map((definition) => ({
    id: definition.slug,
    slug: definition.slug,
    title: definition.title,
    description: definition.description,
    category: definition.category,
    items: images
      .filter((image) => image.category === definition.category)
      .map((item) => mapGalleryRecord({ ...item, collection: { slug: definition.slug } })),
  })).filter((collection) => collection.items.length > 0);
}

export const fetchGalleryCollections = cache(async function fetchGalleryCollections(): Promise<GalleryCollection[]> {
  const ready = await isGallerySchemaReady();
  if (!ready) {
    const grouped = await fetchGalleryCollectionsByCategory();
    if (grouped.length === 0) {
      return resolveContent([
        {
          id: "fallback-art",
          slug: "art",
          title: "Art & creative life",
          category: "ART",
          items: fallbackGalleryItems.filter((i) => i.category === "ART"),
        },
      ]);
    }
    return resolveContent(grouped);
  }

  const records = await prisma.galleryCollection.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      images: {
        where: { isPublished: true },
        orderBy: [...galleryImageOrderBy(true)],
      },
    },
  });

  if (records.length === 0) {
    return resolveContent([
      {
        id: "fallback-art",
        slug: "art",
        title: "Art & creative life",
        category: "ART",
        items: fallbackGalleryItems.filter((i) => i.category === "ART"),
      },
    ]);
  }

  return resolveContent(
    records.map((collection) => ({
      id: collection.id,
      slug: collection.slug,
      title: collection.title,
      description: collection.description ?? undefined,
      category: collection.category as GalleryCategory,
      items: collection.images.map((item) =>
        mapGalleryRecord({ ...item, collection: { slug: collection.slug } }),
      ),
    })),
  );
});

export const fetchGalleryItemsByCategory = cache(async function fetchGalleryItemsByCategory(
  category: GalleryCategory,
): Promise<GalleryItem[]> {
  const ready = await isGallerySchemaReady();
  const records = await prisma.galleryImage.findMany({
    where: { isPublished: true, category },
    orderBy: [...galleryImageOrderBy(ready)],
    ...(ready ? { include: { collection: { select: { slug: true } } } } : {}),
  });

  return resolveContent(records.map((item) => mapGalleryRecord(item)));
});

export const fetchGalleryItemsByCollection = cache(async function fetchGalleryItemsByCollection(
  collectionSlug: string,
  limit?: number,
): Promise<GalleryItem[]> {
  const ready = await isGallerySchemaReady();
  if (!ready) {
    const definition = DEFAULT_GALLERY_COLLECTIONS.find((entry) => entry.slug === collectionSlug);
    if (!definition) {
      return [];
    }
    return fetchGalleryItemsByCategory(definition.category);
  }

  const collection = await prisma.galleryCollection.findUnique({
    where: { slug: collectionSlug },
    include: {
      images: {
        where: { isPublished: true },
        orderBy: [...galleryImageOrderBy(true)],
        ...(typeof limit === "number" ? { take: limit } : {}),
      },
    },
  });

  if (!collection) {
    return [];
  }

  return resolveContent(
    collection.images.map((item) =>
      mapGalleryRecord({ ...item, collection: { slug: collection.slug } }),
    ),
  );
});

/** @deprecated Prefer fetchGalleryCollections for segregated display. */
export async function fetchGalleryItems(): Promise<GalleryItem[]> {
  const collections = await fetchGalleryCollections();
  if (collections.length === 0) {
    return resolveContent([...fallbackGalleryItems]);
  }

  return resolveContent(collections.flatMap((collection) => collection.items));
}

export const fetchFeaturedGalleryItems = cache(async function fetchFeaturedGalleryItems(): Promise<GalleryItem[]> {
  return getFeaturedGalleryItemsCached();
});

async function fetchFeaturedGalleryItemsUncached(): Promise<GalleryItem[]> {
  const ready = await isGallerySchemaReady();
  const records = await prisma.galleryImage.findMany({
    where: { isPublished: true, featuredOnHomepage: true },
    orderBy: [...galleryImageOrderBy(ready)],
    take: 16,
    ...(ready ? { include: { collection: { select: { slug: true } } } } : {}),
  });

  if (records.length === 0) {
    return resolveContent(fallbackGalleryItems.slice(0, 3));
  }

  return resolveContent(records.map((item) => mapGalleryRecord(item)));
}

const getFeaturedGalleryItemsCached = unstable_cache(
  fetchFeaturedGalleryItemsUncached,
  ["featured-gallery-items"],
  { revalidate: 60, tags: ["gallery"] },
);

export async function fetchGalleryCollage(slug: string): Promise<GalleryCollage | null> {
  const ready = await isGallerySchemaReady();
  if (!ready) {
    return null;
  }

  const collage = await prisma.galleryCollage.findUnique({
    where: { slug, isPublished: true },
    include: { collection: { select: { slug: true } } },
  });

  if (!collage) {
    return null;
  }

  const imageIds = Array.isArray(collage.imageIds) ? (collage.imageIds as string[]) : [];

  const images = imageIds.length
    ? await prisma.galleryImage.findMany({
        where: { id: { in: imageIds }, isPublished: true },
        ...(ready ? { include: { collection: { select: { slug: true } } } } : {}),
      })
    : [];

  const imageMap = new Map(images.map((item) => [item.id, item]));
  const orderedItems = imageIds
    .map((id) => imageMap.get(id))
    .filter(Boolean)
    .map((item) => mapGalleryRecord(item!));

  return {
    id: collage.id,
    name: collage.name,
    slug: collage.slug,
    layout: collage.layout,
    category: collage.category as GalleryCategory,
    collectionId: collage.collectionId ?? undefined,
    collectionSlug: collage.collection?.slug,
    items: orderedItems,
  };
}

export const fetchGalleryCollages = cache(async function fetchGalleryCollages(): Promise<GalleryCollage[]> {
  const ready = await isGallerySchemaReady();
  if (!ready) {
    return [];
  }

  const collages = await prisma.galleryCollage.findMany({
    where: { isPublished: true },
    orderBy: { name: "asc" },
    include: { collection: { select: { slug: true } } },
  });

  if (collages.length === 0) {
    return [];
  }

  const allImageIds = [
    ...new Set(
      collages.flatMap((collage) =>
        Array.isArray(collage.imageIds) ? (collage.imageIds as string[]) : [],
      ),
    ),
  ];

  const images = allImageIds.length
    ? await prisma.galleryImage.findMany({
        where: { id: { in: allImageIds }, isPublished: true },
        include: { collection: { select: { slug: true } } },
      })
    : [];

  const imageMap = new Map(images.map((item) => [item.id, item]));

  return collages.map((collage) => {
    const imageIds = Array.isArray(collage.imageIds) ? (collage.imageIds as string[]) : [];
    const orderedItems = imageIds
      .map((id) => imageMap.get(id))
      .filter(Boolean)
      .map((item) => mapGalleryRecord(item!));

    return {
      id: collage.id,
      name: collage.name,
      slug: collage.slug,
      layout: collage.layout,
      category: collage.category as GalleryCategory,
      collectionId: collage.collectionId ?? undefined,
      collectionSlug: collage.collection?.slug,
      items: orderedItems,
    };
  });
});
