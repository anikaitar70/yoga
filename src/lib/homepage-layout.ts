import type { CSSProperties } from "react";
import {
  DEFAULT_HOMEPAGE_SPACING,
  type HomepageSpacingSettings,
} from "@/lib/homepage-spacing";
import {
  defaultLayoutForSectionType,
  mergeLayoutSettings,
  type SectionImageSide,
  type SectionLayoutSettings,
} from "@/lib/section-layout";
import type { PageSectionType } from "@/lib/page-section-types";

export { DEFAULT_HOMEPAGE_SPACING } from "@/lib/homepage-spacing";
export type { HomepageSpacingSettings } from "@/lib/homepage-spacing";

export const HOMEPAGE_SECTION_IDS = [
  "hero",
  "about-preview",
  "philosophy",
  "pathway-yoga",
  "pathway-healing",
  "pathway-art",
  "featured-events",
  "retreats",
  "gallery",
  "testimonials",
  "newsletter",
  "contact",
] as const;

export type HomepageSectionId = (typeof HOMEPAGE_SECTION_IDS)[number];

export type HomepageSectionDefinition = {
  id: HomepageSectionId;
  sectionType: PageSectionType;
  title: string;
};

export const HOMEPAGE_SECTION_DEFINITIONS: HomepageSectionDefinition[] = [
  { id: "hero", sectionType: "HERO", title: "Hero" },
  { id: "about-preview", sectionType: "IMAGE_TEXT", title: "About preview" },
  { id: "philosophy", sectionType: "CUSTOM_TEXT", title: "Philosophy" },
  { id: "pathway-yoga", sectionType: "IMAGE_TEXT", title: "Yoga pathway" },
  { id: "pathway-healing", sectionType: "IMAGE_TEXT", title: "Healing pathway" },
  { id: "pathway-art", sectionType: "IMAGE_TEXT", title: "Just Art Life pathway" },
  { id: "featured-events", sectionType: "EVENTS", title: "Featured events" },
  { id: "retreats", sectionType: "EVENTS", title: "Retreats & tours" },
  { id: "gallery", sectionType: "GALLERY", title: "Gallery" },
  { id: "testimonials", sectionType: "TESTIMONIALS", title: "Testimonials" },
  { id: "newsletter", sectionType: "CUSTOM_TEXT", title: "Newsletter" },
  { id: "contact", sectionType: "CONTACT", title: "Contact" },
];

export type HomepageLayoutSettings = HomepageSpacingSettings & {
  sectionLayouts?: Partial<Record<HomepageSectionId, SectionLayoutSettings>>;
};

function legacySpacingToSectionLayouts(
  spacing: HomepageSpacingSettings,
): Partial<Record<HomepageSectionId, SectionLayoutSettings>> {
  return {
    hero: mergeLayoutSettings(
      {
        paddingTop: spacing.heroPaddingY,
        paddingBottom: spacing.heroPaddingY,
        imageHeight: Math.round((spacing.heroMinHeightVh / 100) * 820),
      },
      "HERO",
    ),
    gallery: mergeLayoutSettings(
      {
        paddingTop: spacing.galleryPaddingTop,
        galleryHeight: spacing.galleryHeight,
      },
      "GALLERY",
    ),
  };
}

export function resolveHomepageSectionLayouts(
  layout: HomepageLayoutSettings | null | undefined,
): Record<HomepageSectionId, SectionLayoutSettings> {
  const spacing = layout ?? DEFAULT_HOMEPAGE_SPACING;
  const migrated =
    layout?.sectionLayouts && Object.keys(layout.sectionLayouts).length > 0
      ? layout.sectionLayouts
      : legacySpacingToSectionLayouts(spacing);

  const resolved = {} as Record<HomepageSectionId, SectionLayoutSettings>;
  for (const definition of HOMEPAGE_SECTION_DEFINITIONS) {
    resolved[definition.id] = mergeLayoutSettings(
      migrated[definition.id] ?? null,
      definition.sectionType,
    );
    if (definition.id !== "hero" && typeof spacing.sectionGap === "number") {
      resolved[definition.id] = {
        ...resolved[definition.id],
        sectionGap: spacing.sectionGap,
      };
    }
  }
  return resolved;
}

export function homepageLayoutToCssVariables(
  layout: HomepageLayoutSettings | null | undefined,
): Record<string, string> {
  const spacing = layout ?? DEFAULT_HOMEPAGE_SPACING;
  const sectionLayouts = resolveHomepageSectionLayouts(layout);
  const hero = sectionLayouts.hero;
  const gallery = sectionLayouts.gallery;

  return {
    "--home-hero-py": `${hero.paddingTop ?? spacing.heroPaddingY}px`,
    "--home-hero-min-h": `${spacing.heroMinHeightVh}vh`,
    "--home-section-gap": `${spacing.sectionGap}px`,
    "--home-gallery-pt": `${gallery.paddingTop ?? spacing.galleryPaddingTop}px`,
    "--gallery-h": `${gallery.galleryHeight ?? spacing.galleryHeight}px`,
  };
}

export function heroLayoutToCssVariables(
  layout: SectionLayoutSettings | null | undefined,
): CSSProperties {
  const merged = mergeLayoutSettings(layout, "HERO");
  const minHeightPx = merged.imageHeight ?? 640;
  const minHeightVh = Math.min(100, Math.max(40, Math.round((minHeightPx / 820) * 100)));

  return {
    "--home-hero-py": `${merged.paddingTop ?? 80}px`,
    "--home-hero-min-h": `${minHeightVh}vh`,
  } as CSSProperties;
}

export function buildHomepageLayoutPayload(
  sectionLayouts: Record<string, SectionLayoutSettings>,
  spacing: HomepageSpacingSettings,
): HomepageLayoutSettings {
  return {
    ...spacing,
    sectionLayouts: sectionLayouts as Partial<Record<HomepageSectionId, SectionLayoutSettings>>,
  };
}

export function defaultLayoutForHomepageSection(sectionId: HomepageSectionId): SectionLayoutSettings {
  const definition = HOMEPAGE_SECTION_DEFINITIONS.find((entry) => entry.id === sectionId);
  return defaultLayoutForSectionType(definition?.sectionType ?? "CUSTOM_TEXT");
}

export const PATHWAY_SECTION_IDS = [
  "pathway-yoga",
  "pathway-healing",
  "pathway-art",
] as const satisfies readonly HomepageSectionId[];

const DEFAULT_PATHWAY_SIDES: SectionImageSide[] = ["left", "right", "left"];

export function resolveHomepagePathwayImageSide(
  pathway: { imageSide?: SectionImageSide },
  index: number,
): SectionImageSide {
  return pathway.imageSide ?? DEFAULT_PATHWAY_SIDES[index] ?? "left";
}

export function resolveHomepageAboutImageSide(about: {
  imageSide?: SectionImageSide;
}): SectionImageSide {
  return about.imageSide ?? "left";
}
