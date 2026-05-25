export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  aspectClass?: string;
}

/** @deprecated Use `GalleryItem` */
export type GalleryImage = GalleryItem;
