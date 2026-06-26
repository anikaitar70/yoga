import { fetchFeaturedGalleryItems } from "@/content";
import { fetchHomepageSections, fetchSite } from "@/content/repositories/site";
import { HomeGallerySection } from "@/components/home/HomeGallerySection";
import { resolveHomepageSectionLayouts, type HomepageLayoutSettings } from "@/lib/homepage-layout";

export async function HomeGalleryPreview() {
  const [items, sections, site] = await Promise.all([
    fetchFeaturedGalleryItems(),
    fetchHomepageSections(),
    fetchSite(),
  ]);
  if (items.length === 0) {
    return null;
  }

  const sectionLayouts = resolveHomepageSectionLayouts(
    site.homepageLayout as HomepageLayoutSettings | undefined,
  );

  return (
    <HomeGallerySection items={items} chrome={sections.gallery} layout={sectionLayouts.gallery} />
  );
}
