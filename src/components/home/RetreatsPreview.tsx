import { fetchEventsByCategory } from "@/content/repositories/events";
import { fetchHomepageSections } from "@/content/repositories/site";
import { RetreatsPreviewSectionView } from "@/components/home/HomepageSectionViews";

export async function RetreatsPreview() {
  const [retreats, sections] = await Promise.all([
    fetchEventsByCategory("retreats").then((items) => items.slice(0, 3)),
    fetchHomepageSections(),
  ]);
  return <RetreatsPreviewSectionView events={retreats} chrome={sections.retreats} />;
}
