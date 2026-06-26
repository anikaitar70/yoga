import { fetchHero } from "@/content";
import { fetchSite } from "@/content/repositories/site";
import { HeroSectionView } from "@/components/home/HeroSectionView";
import { resolveHomepageSectionLayouts, type HomepageLayoutSettings } from "@/lib/homepage-layout";

export async function Hero() {
  const [hero, site] = await Promise.all([fetchHero(), fetchSite()]);
  const sectionLayouts = resolveHomepageSectionLayouts(
    site.homepageLayout as HomepageLayoutSettings | undefined,
  );
  const gap = sectionLayouts.hero.sectionGap ?? 0;

  return (
    <div style={gap > 0 ? { marginBottom: `${gap}px` } : undefined}>
      <HeroSectionView hero={hero} />
    </div>
  );
}
