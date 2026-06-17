import { fetchFeaturedGalleryItems } from "@/content";
import { fetchHomepageSections } from "@/content/repositories/site";
import { HomeGallerySection } from "@/components/home/HomeGallerySection";

export async function HomeGalleryPreview() {
  const [items, sections] = await Promise.all([
    fetchFeaturedGalleryItems(),
    fetchHomepageSections(),
  ]);
  if (items.length === 0) {
    return null;
  }

  return <HomeGallerySection items={items} chrome={sections.gallery} />;
}
