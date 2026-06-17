import { fetchHero } from "@/content";
import { HeroSectionView } from "@/components/home/HeroSectionView";

export async function Hero() {
  const hero = await fetchHero();
  return <HeroSectionView hero={hero} />;
}
