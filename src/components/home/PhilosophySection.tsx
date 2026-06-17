import { fetchPhilosophy } from "@/content";
import { PhilosophySectionView } from "@/components/home/HomepageSectionViews";

export async function PhilosophySection() {
  const philosophy = await fetchPhilosophy();
  return <PhilosophySectionView philosophy={philosophy} />;
}
