import { fetchHealingModalities } from "@/content";
import { HealingList } from "@/components/content/HealingList";
import { EmptyState } from "@/components/ui/EmptyState";

export async function HealingSection() {
  const items = await fetchHealingModalities();

  if (items.length === 0) {
    return (
      <EmptyState
        title="Healing offerings coming soon"
        description="Supportive modalities will be listed here as they are confirmed."
        actionLabel="Contact the studio"
        actionHref="/contact"
      />
    );
  }

  return <HealingList items={items} />;
}
