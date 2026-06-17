import { fetchGalleryCollections, fetchGalleryCollages } from "@/content";
import { GalleryCollectionsView } from "@/components/content/GalleryCollectionsView";
import type { CollageLayout } from "@/lib/collage-layouts";
import type { GalleryItem } from "@/content/types";

export async function GallerySection() {
  const [collections, collages] = await Promise.all([
    fetchGalleryCollections(),
    fetchGalleryCollages(),
  ]);

  const collagesByCollection: Record<string, { layout: CollageLayout; items: GalleryItem[] }> = {};

  for (const collage of collages) {
    if (collage.collectionSlug) {
      collagesByCollection[collage.collectionSlug] = {
        layout: collage.layout,
        items: collage.items,
      };
    }
  }

  return <GalleryCollectionsView collections={collections} collagesByCollection={collagesByCollection} />;
}
