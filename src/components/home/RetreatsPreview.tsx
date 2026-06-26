import { fetchEventsByCategory } from "@/content/repositories/events";
import { fetchHomepageSections, fetchSite } from "@/content/repositories/site";
import { RetreatsPreviewSectionView } from "@/components/home/HomepageSectionViews";
import { resolveHomepageSectionLayouts, type HomepageLayoutSettings } from "@/lib/homepage-layout";

export async function RetreatsPreview() {
  const [retreats, sections, site] = await Promise.all([
    fetchEventsByCategory("retreats").then((items) => items.slice(0, 3)),
    fetchHomepageSections(),
    fetchSite(),
  ]);
  const sectionLayouts = resolveHomepageSectionLayouts(
    site.homepageLayout as HomepageLayoutSettings | undefined,
  );
  return (
    <RetreatsPreviewSectionView
      events={retreats}
      chrome={sections.retreats}
      layout={sectionLayouts.retreats}
    />
  );
}
