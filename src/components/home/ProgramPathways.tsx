import { fetchHomepageSections } from "@/content/repositories/site";
import { ProgramPathwaySection, type ProgramPathway } from "@/components/home/ProgramPathwaySection";
import { resolveHomepagePathwayImageSide } from "@/lib/homepage-layout";

const DEFAULT_VARIANTS: ProgramPathway["variant"][] = ["default", "warm", "muted"];

export async function ProgramPathways() {
  const sections = await fetchHomepageSections();

  const pathways: ProgramPathway[] = sections.pathways.map((pathway, index) => ({
    ...pathway,
    variant: pathway.variant ?? DEFAULT_VARIANTS[index] ?? "default",
    imageSide: resolveHomepagePathwayImageSide(pathway, index),
  }));

  return (
    <>
      {pathways.map((pathway) => (
        <ProgramPathwaySection key={pathway.href} pathway={pathway} />
      ))}
    </>
  );
}
