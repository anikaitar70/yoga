import { fetchYogaOfferings } from "@/content";
import { ContentBlockList } from "@/components/content/ContentBlockList";

export async function YogaOfferingsSection() {
  const items = await fetchYogaOfferings();
  return (
    <ContentBlockList
      items={items}
      emptyTitle="Classes coming soon"
      emptyDescription="New class descriptions will be posted here shortly."
    />
  );
}
