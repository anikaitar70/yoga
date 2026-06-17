/** Homepage layout settings (used by both preview + public homepage). */
export type HomepageSpacingSettings = {  heroPaddingY: number;
  heroMinHeightVh: number;
  sectionGap: number;
  galleryPaddingTop: number;
  galleryHeight: number;
};

export const DEFAULT_HOMEPAGE_SPACING: HomepageSpacingSettings = {
  heroPaddingY: 80,
  heroMinHeightVh: 90,
  sectionGap: 0,
  galleryPaddingTop: 80,
  galleryHeight: 300,
};

export function homepageSpacingToCssVariables(
  spacing: HomepageSpacingSettings,
): Record<string, string> {
  return {
    "--home-hero-py": `${spacing.heroPaddingY}px`,
    "--home-hero-min-h": `${spacing.heroMinHeightVh}vh`,
    "--home-section-gap": `${spacing.sectionGap}px`,
    "--home-gallery-pt": `${spacing.galleryPaddingTop}px`,
    "--gallery-h": `${spacing.galleryHeight}px`,
  };
}
