import { fetchHomepageSections, fetchSite } from "@/content/repositories/site";
import { ProgramPathwaySection, type ProgramPathway } from "@/components/home/ProgramPathwaySection";
import { sanitizeRichTextHtml } from "@/lib/rich-text-server";
import {
  PATHWAY_SECTION_IDS,
  resolveHomepagePathwayImageSide,
  resolveHomepageSectionLayouts,
  type HomepageLayoutSettings,
} from "@/lib/homepage-layout";

const DEFAULT_VARIANTS: ProgramPathway["variant"][] = ["default", "warm", "muted"];

export async function ProgramPathways() {
  const [sections, site] = await Promise.all([fetchHomepageSections(), fetchSite()]);
  const sectionLayouts = resolveHomepageSectionLayouts(
    site.homepageLayout as HomepageLayoutSettings | undefined,
  );

  const pathways: ProgramPathway[] = sections.pathways.map((pathway, index) => ({
    ...pathway,
    // Description crosses into a client component — sanitize at the boundary.
    description: sanitizeRichTextHtml(pathway.description),
    variant: pathway.variant ?? DEFAULT_VARIANTS[index] ?? "default",
    imageSide: resolveHomepagePathwayImageSide(pathway, index),
  }));

  return (
    <>
      {pathways.map((pathway, index) => (
        <ProgramPathwaySection
          key={pathway.href}
          pathway={pathway}
          layout={sectionLayouts[PATHWAY_SECTION_IDS[index]!]}
        />
      ))}
    </>
  );
}
