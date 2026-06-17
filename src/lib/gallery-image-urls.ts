import type { GalleryItem } from "@/content/types";

/** Grid thumbnails — smallest variant for fast initial paint. */
export function galleryThumbnailSrc(item: Pick<GalleryItem, "src" | "thumbnailSrc" | "mediumSrc" | "fullSrc">): string {
  return item.thumbnailSrc ?? item.mediumSrc ?? item.src;
}

/** Lightbox preview — medium variant before full resolution. */
export function galleryMediumSrc(item: Pick<GalleryItem, "src" | "mediumSrc" | "fullSrc">): string {
  return item.mediumSrc ?? item.fullSrc ?? item.src;
}

/** Fullscreen lightbox — original or largest stored variant. */
export function galleryFullSrc(item: Pick<GalleryItem, "src" | "fullSrc">): string {
  return item.fullSrc ?? item.src;
}
