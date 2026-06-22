import type { PageType } from "@/lib/page-section-types";
import type { BrandKey } from "@/lib/site-branding";

type SectionTitleBrandInput = {
  title?: string | null;
  payload?: unknown;
};

/** Resolve optional brand logo for a section heading (custom font/logo overrides text title). */
export function resolveSectionTitleBrand(
  section: SectionTitleBrandInput,
  pageType?: PageType,
): BrandKey | undefined {
  const payload =
    section.payload && typeof section.payload === "object" && !Array.isArray(section.payload)
      ? (section.payload as Record<string, unknown>)
      : null;

  const payloadBrand = payload?.titleBrand;
  if (payloadBrand === "justArtAffaire" || payloadBrand === "nirvanaYoga") {
    return payloadBrand;
  }

  if (pageType === "JUST_ART_LIFE" && section.title === "Just Art Affaire") {
    return "justArtAffaire";
  }

  return undefined;
}
