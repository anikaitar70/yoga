import { fetchPhilosophy } from "@/content";
import { fetchSite } from "@/content/repositories/site";
import { PhilosophySectionView } from "@/components/home/HomepageSectionViews";
import { resolveHomepageSectionLayouts, type HomepageLayoutSettings } from "@/lib/homepage-layout";

export async function PhilosophySection() {
  const [philosophy, site] = await Promise.all([fetchPhilosophy(), fetchSite()]);
  const sectionLayouts = resolveHomepageSectionLayouts(
    site.homepageLayout as HomepageLayoutSettings | undefined,
  );
  return <PhilosophySectionView philosophy={philosophy} layout={sectionLayouts.philosophy} />;
}
