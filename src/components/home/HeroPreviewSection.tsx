import { HeroSectionView } from "@/components/home/HeroSectionView";
import type { HeroContent } from "@/content/types";
import { heroLayoutToCssVariables } from "@/lib/homepage-layout";
import type { SectionLayoutSettings } from "@/lib/section-layout";

export function HeroPreviewSection({
  hero,
  layout,
}: {
  hero: HeroContent;
  layout?: SectionLayoutSettings | null;
}) {
  return (
    <div style={heroLayoutToCssVariables(layout)}>
      <HeroSectionView hero={hero} />
    </div>
  );
}
