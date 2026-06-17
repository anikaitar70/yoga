import type { CustomTextSectionPayload, PageType } from "@/lib/page-section-types";

export type CustomTextVariant = NonNullable<CustomTextSectionPayload["variant"]>;

export const CUSTOM_TEXT_VARIANTS_BY_PAGE: Record<PageType, CustomTextVariant[]> = {
  YOGA: ["default", "yoga-journey"],
  HEALING: ["default", "healing-journey"],
  JUST_ART_LIFE: ["default", "art-journey"],
  ABOUT: ["default", "experience-timeline", "philosophy"],
};

export function isCustomTextVariantAllowed(
  pageType: PageType,
  variant: CustomTextVariant | undefined,
): boolean {
  const allowed = CUSTOM_TEXT_VARIANTS_BY_PAGE[pageType];
  const value = variant ?? "default";
  return allowed.includes(value);
}
