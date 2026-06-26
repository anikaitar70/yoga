import { fetchFeaturedEvents, fetchUpcomingEvents } from "@/content/repositories/events";
import { fetchHomepageSections, fetchSite } from "@/content/repositories/site";
import { FeaturedEventsSectionView } from "@/components/home/HomepageSectionViews";
import { resolveHomepageSectionLayouts, type HomepageLayoutSettings } from "@/lib/homepage-layout";

export async function FeaturedEventsSection() {
  const [featured, sections, site] = await Promise.all([
    fetchFeaturedEvents(12),
    fetchHomepageSections(),
    fetchSite(),
  ]);
  const events = featured.length > 0 ? featured : await fetchUpcomingEvents(12);
  const sectionLayouts = resolveHomepageSectionLayouts(
    site.homepageLayout as HomepageLayoutSettings | undefined,
  );
  return (
    <FeaturedEventsSectionView
      events={events}
      chrome={sections.featuredEvents}
      layout={sectionLayouts["featured-events"]}
    />
  );
}
