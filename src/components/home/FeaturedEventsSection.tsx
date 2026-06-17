import { fetchFeaturedEvents, fetchUpcomingEvents } from "@/content/repositories/events";
import { fetchHomepageSections } from "@/content/repositories/site";
import { FeaturedEventsSectionView } from "@/components/home/HomepageSectionViews";

export async function FeaturedEventsSection() {
  const [featured, sections] = await Promise.all([
    fetchFeaturedEvents(12),
    fetchHomepageSections(),
  ]);
  const events = featured.length > 0 ? featured : await fetchUpcomingEvents(12);
  return <FeaturedEventsSectionView events={events} chrome={sections.featuredEvents} />;
}
