import type { GalleryCategory } from "@/lib/gallery-categories";
import type { CollageLayout } from "@/lib/collage-layouts";

export interface GalleryItem {
  id: string;
  src: string;
  /** Full-resolution URL for lightbox (defaults to src). */
  fullSrc?: string;
  /** Medium variant for lightbox progressive load. */
  mediumSrc?: string;
  /** Thumbnail for grid display (defaults to src). */
  thumbnailSrc?: string;
  alt: string;
  title?: string;
  description?: string;
  category?: GalleryCategory;
  collectionId?: string;
  collectionSlug?: string;
  aspectClass?: string;
  featuredOnHomepage?: boolean;
}

/** @deprecated Use `GalleryItem` */
export type GalleryImage = GalleryItem;

export interface GalleryCollection {
  id: string;
  slug: string;
  title: string;
  description?: string;
  category: GalleryCategory;
  items: GalleryItem[];
}

export interface GalleryCollage {
  id: string;
  name: string;
  slug: string;
  layout: CollageLayout;
  category: GalleryCategory;
  collectionId?: string;
  collectionSlug?: string;
  items: GalleryItem[];
}
