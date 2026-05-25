import { fetchGalleryItems } from "@/content";
import { GalleryList } from "@/components/content/GalleryList";

export async function GallerySection() {
  const items = await fetchGalleryItems();
  return <GalleryList items={items} />;
}
