import { z } from "zod";
import type { CSSProperties } from "react";
import type { DesignSettingsOverride } from "@/lib/design-settings";

export const SECTION_SPACING_OPTIONS = ["tight", "normal", "spacious"] as const;
export const SECTION_WIDTH_OPTIONS = ["narrow", "normal", "wide"] as const;
export const SECTION_ALIGN_OPTIONS = ["left", "center"] as const;
export const SECTION_IMAGE_ASPECT_OPTIONS = ["auto", "landscape", "wide", "square", "compact"] as const;
export const SECTION_IMAGE_SIDE_OPTIONS = ["left", "right"] as const;
export const SECTION_ANIMATION_OPTIONS = ["none", "fade", "rise", "stagger"] as const;
export const SECTION_STYLE_OPTIONS = ["default", "warm", "muted", "immersive"] as const;
export const SECTION_GALLERY_STYLE_OPTIONS = ["horizontal", "masonry", "grid", "immersive"] as const;

export type SectionSpacing = (typeof SECTION_SPACING_OPTIONS)[number];
export type SectionAnimationPreset = (typeof SECTION_ANIMATION_OPTIONS)[number];
export type SectionStylePreset = (typeof SECTION_STYLE_OPTIONS)[number];
export type SectionGalleryStyle = (typeof SECTION_GALLERY_STYLE_OPTIONS)[number];
export type SectionContentWidth = (typeof SECTION_WIDTH_OPTIONS)[number];
export type SectionTextAlignment = (typeof SECTION_ALIGN_OPTIONS)[number];
export type SectionImageAspect = (typeof SECTION_IMAGE_ASPECT_OPTIONS)[number];
export type SectionImageSide = (typeof SECTION_IMAGE_SIDE_OPTIONS)[number];

export const LAYOUT_TUNING_RANGES = {
  paddingTop: { min: 0, max: 160, step: 4, default: 0 },
  paddingBottom: { min: 0, max: 160, step: 4, default: 0 },
  imageHeight: { min: 120, max: 640, step: 8, default: 360 },
  imageAspectRatio: { min: 0.75, max: 2.4, step: 0.05, default: 1.78 },
  contentWidthPx: { min: 400, max: 1400, step: 20, default: 960 },
  textMaxWidthPx: { min: 320, max: 900, step: 20, default: 640 },
  sectionGap: { min: 0, max: 120, step: 4, default: 0 },
  cardWidth: { min: 200, max: 480, step: 8, default: 280 },
  galleryHeight: { min: 120, max: 480, step: 8, default: 280 },
  desktopCardsVisible: { min: 1, max: 6, step: 1, default: 3 },
} as const;

export type SectionLayoutSettings = {
  spacing?: SectionSpacing;
  contentWidth?: SectionContentWidth;
  textAlignment?: SectionTextAlignment;
  imageAspect?: SectionImageAspect;
  /** Image + text sections: which side the photo appears on (desktop). */
  imageSide?: SectionImageSide;
  paddingTop?: number;
  paddingBottom?: number;
  imageHeight?: number;
  imageAspectRatio?: number;
  contentWidthPx?: number;
  textMaxWidthPx?: number;
  sectionGap?: number;
  cardWidth?: number;
  galleryHeight?: number;
  desktopCardsVisible?: number;
  /** Scroll reveal animation preset for public page sections. */
  animationPreset?: SectionAnimationPreset;
  /** Background / atmosphere preset. */
  sectionStyle?: SectionStylePreset;
  /** Gallery layout style (GALLERY sections only). */
  galleryStyle?: SectionGalleryStyle;
  /** Optional typography/color overrides for this section only. */
  designOverrides?: DesignSettingsOverride;
};

const numericRange = (key: keyof typeof LAYOUT_TUNING_RANGES) => {
  const range = LAYOUT_TUNING_RANGES[key];
  return z.number().min(range.min).max(range.max).optional();
};

export const sectionLayoutSchema = z.object({
  spacing: z.enum(SECTION_SPACING_OPTIONS).optional(),
  contentWidth: z.enum(SECTION_WIDTH_OPTIONS).optional(),
  textAlignment: z.enum(SECTION_ALIGN_OPTIONS).optional(),
  imageAspect: z.enum(SECTION_IMAGE_ASPECT_OPTIONS).optional(),
  imageSide: z.enum(SECTION_IMAGE_SIDE_OPTIONS).optional(),
  paddingTop: numericRange("paddingTop"),
  paddingBottom: numericRange("paddingBottom"),
  imageHeight: numericRange("imageHeight"),
  imageAspectRatio: numericRange("imageAspectRatio"),
  contentWidthPx: numericRange("contentWidthPx"),
  textMaxWidthPx: numericRange("textMaxWidthPx"),
  sectionGap: numericRange("sectionGap"),
  cardWidth: numericRange("cardWidth"),
  galleryHeight: numericRange("galleryHeight"),
  desktopCardsVisible: numericRange("desktopCardsVisible"),
  animationPreset: z.enum(SECTION_ANIMATION_OPTIONS).optional(),
  sectionStyle: z.enum(SECTION_STYLE_OPTIONS).optional(),
  galleryStyle: z.enum(SECTION_GALLERY_STYLE_OPTIONS).optional(),
  designOverrides: z.record(z.string(), z.unknown()).optional(),
});

export const SECTION_ANIMATION_LABELS: Record<SectionAnimationPreset, string> = {
  none: "None",
  fade: "Fade in",
  rise: "Rise up",
  stagger: "Stagger children",
};

export const SECTION_STYLE_LABELS: Record<SectionStylePreset, string> = {
  default: "Default",
  warm: "Warm peach",
  muted: "Sage muted",
  immersive: "Immersive gradient",
};

export const SECTION_GALLERY_STYLE_LABELS: Record<SectionGalleryStyle, string> = {
  horizontal: "Horizontal scroll",
  masonry: "Masonry",
  grid: "Grid",
  immersive: "Immersive scroll",
};

const IMAGE_ASPECT_PRESETS: Record<
  SectionImageAspect,
  { imageHeight: number; imageAspectRatio: number; tailwindAspect?: string }
> = {
  auto: { imageHeight: 320, imageAspectRatio: 0.8, tailwindAspect: "aspect-[4/5]" },
  landscape: { imageHeight: 360, imageAspectRatio: 16 / 9, tailwindAspect: "aspect-video" },
  wide: { imageHeight: 280, imageAspectRatio: 21 / 9, tailwindAspect: "aspect-[21/9]" },
  square: { imageHeight: 320, imageAspectRatio: 1, tailwindAspect: "aspect-square" },
  compact: { imageHeight: 320, imageAspectRatio: 4 / 3, tailwindAspect: "aspect-[4/3]" },
};

export function resolveImageAspectClass(
  layout: SectionLayoutSettings | null | undefined,
  sectionType = "IMAGE_TEXT",
): string {
  const presetKey = layout?.imageAspect ?? defaultLayoutForSectionType(sectionType).imageAspect ?? "compact";
  const preset = IMAGE_ASPECT_PRESETS[presetKey] ?? IMAGE_ASPECT_PRESETS.compact;
  return preset.tailwindAspect ?? "aspect-[4/5]";
}

/** When an aspect preset changes, sync tuned height/ratio used in preview studio. */
export function layoutPatchWithImageAspect(
  patch: Partial<SectionLayoutSettings>,
): Partial<SectionLayoutSettings> {
  if (!patch.imageAspect) return patch;
  const preset = IMAGE_ASPECT_PRESETS[patch.imageAspect] ?? IMAGE_ASPECT_PRESETS.compact;
  return {
    ...patch,
    imageHeight: preset.imageHeight,
    imageAspectRatio: preset.imageAspectRatio,
  };
}

const sectionStyleClasses: Record<SectionStylePreset, string> = {
  default: "",
  warm: "bg-primary-soft/25",
  muted: "bg-accent-soft/25",
  immersive: "bg-gradient-to-b from-background via-surface-warm/30 to-background",
};

export function resolveSectionStyleClass(style?: SectionStylePreset): string {
  return sectionStyleClasses[style ?? "default"];
}

export const SECTION_SPACING_LABELS: Record<SectionSpacing, string> = {
  tight: "Tight",
  normal: "Normal",
  spacious: "Spacious",
};

export const SECTION_WIDTH_LABELS: Record<SectionContentWidth, string> = {
  narrow: "Narrow",
  normal: "Normal",
  wide: "Wide",
};

export const SECTION_ALIGN_LABELS: Record<SectionTextAlignment, string> = {
  left: "Left",
  center: "Center",
};

export const SECTION_IMAGE_ASPECT_LABELS: Record<SectionImageAspect, string> = {
  auto: "Natural height",
  landscape: "Landscape (16:9)",
  wide: "Wide banner (21:9)",
  square: "Square",
  compact: "Compact (4:3)",
};

export const SECTION_IMAGE_SIDE_LABELS: Record<SectionImageSide, string> = {
  left: "Image left",
  right: "Image right",
};

const alignClasses: Record<SectionTextAlignment, string> = {
  left: "text-left",
  center: "text-center mx-auto",
};

function clampValue(value: number, key: keyof typeof LAYOUT_TUNING_RANGES) {
  const range = LAYOUT_TUNING_RANGES[key];
  return Math.min(range.max, Math.max(range.min, value));
}

export function clampLayoutSettings(layout: SectionLayoutSettings): SectionLayoutSettings {
  const next: SectionLayoutSettings = { ...layout };
  (Object.keys(LAYOUT_TUNING_RANGES) as (keyof typeof LAYOUT_TUNING_RANGES)[]).forEach((key) => {
    const value = next[key];
    if (typeof value === "number") {
      next[key] = clampValue(value, key);
    }
  });
  return next;
}

export function parseSectionLayout(value: unknown): SectionLayoutSettings | null {
  if (value == null) return null;
  return clampLayoutSettings(sectionLayoutSchema.parse(value));
}

function presetLayoutNumerics(layout: SectionLayoutSettings) {
  const spacing = layout.spacing ?? "normal";
  const contentWidth = layout.contentWidth ?? "normal";

  return {
    paddingTop: spacing === "tight" ? 24 : spacing === "spacious" ? 48 : 0,
    paddingBottom: spacing === "tight" ? 32 : spacing === "spacious" ? 64 : 0,
    contentWidthPx: contentWidth === "narrow" ? 672 : contentWidth === "wide" ? 1152 : 896,
  };
}

export function resolveLayoutNumerics(
  layout: SectionLayoutSettings,
  sectionType: string,
  saved?: SectionLayoutSettings | null,
) {
  const defaults = defaultLayoutForSectionType(sectionType);
  const presets = presetLayoutNumerics(layout);

  const explicitPaddingTop = typeof saved?.paddingTop === "number" ? saved.paddingTop : undefined;
  const explicitPaddingBottom = typeof saved?.paddingBottom === "number" ? saved.paddingBottom : undefined;

  return {
    paddingTop:
      explicitPaddingTop ??
      presets.paddingTop ??
      defaults.paddingTop ??
      LAYOUT_TUNING_RANGES.paddingTop.default,
    paddingBottom:
      explicitPaddingBottom ??
      presets.paddingBottom ??
      defaults.paddingBottom ??
      LAYOUT_TUNING_RANGES.paddingBottom.default,
    contentWidthPx:
      saved?.contentWidthPx ??
      presets.contentWidthPx ??
      defaults.contentWidthPx ??
      LAYOUT_TUNING_RANGES.contentWidthPx.default,
    textMaxWidthPx:
      saved?.textMaxWidthPx ?? defaults.textMaxWidthPx ?? LAYOUT_TUNING_RANGES.textMaxWidthPx.default,
    imageHeight: (() => {
      if (typeof saved?.imageHeight === "number" && saved.imageHeight > 0) return saved.imageHeight;
      const preset = layout.imageAspect ? IMAGE_ASPECT_PRESETS[layout.imageAspect] : undefined;
      return preset?.imageHeight ?? defaults.imageHeight ?? LAYOUT_TUNING_RANGES.imageHeight.default;
    })(),
    imageAspectRatio: (() => {
      if (typeof saved?.imageAspectRatio === "number") return saved.imageAspectRatio;
      const preset = layout.imageAspect ? IMAGE_ASPECT_PRESETS[layout.imageAspect] : undefined;
      return preset?.imageAspectRatio ?? defaults.imageAspectRatio ?? LAYOUT_TUNING_RANGES.imageAspectRatio.default;
    })(),
    sectionGap: saved?.sectionGap ?? defaults.sectionGap ?? LAYOUT_TUNING_RANGES.sectionGap.default,
    cardWidth: saved?.cardWidth ?? defaults.cardWidth ?? LAYOUT_TUNING_RANGES.cardWidth.default,
    galleryHeight: saved?.galleryHeight ?? defaults.galleryHeight ?? LAYOUT_TUNING_RANGES.galleryHeight.default,
    desktopCardsVisible:
      saved?.desktopCardsVisible ??
      defaults.desktopCardsVisible ??
      LAYOUT_TUNING_RANGES.desktopCardsVisible.default,
  };
}

export function sectionImageStyleFromLayout(
  layout: SectionLayoutSettings | null | undefined,
  sectionType = "IMAGE_TEXT",
): CSSProperties | undefined {
  if (!layout) return undefined;
  const merged = { ...defaultLayoutForSectionType(sectionType), ...layout };
  const numerics = resolveLayoutNumerics(merged, sectionType, layout);
  if (numerics.imageHeight <= 0) return undefined;

  return {
    width: "100%",
    height: `${numerics.imageHeight}px`,
    minHeight: `${numerics.imageHeight}px`,
    maxHeight: `${numerics.imageHeight}px`,
    position: "relative",
  };
}

export function layoutToCssVariables(
  layout: SectionLayoutSettings | null | undefined,
  sectionType = "CUSTOM_TEXT",
): CSSProperties {
  if (!layout) return {};
  const merged = { ...defaultLayoutForSectionType(sectionType), ...layout };
  const numerics = resolveLayoutNumerics(merged, sectionType, layout);

  const vars: Record<string, string> = {
    "--section-pt": `${numerics.paddingTop}px`,
    "--section-pb": `${numerics.paddingBottom}px`,
    "--content-max-w": `${numerics.contentWidthPx}px`,
    "--text-max-w": `${numerics.textMaxWidthPx}px`,
    "--image-h": `${numerics.imageHeight}px`,
    "--image-aspect": String(numerics.imageAspectRatio),
    "--section-gap": `${numerics.sectionGap}px`,
    "--card-w": `${numerics.cardWidth}px`,
    "--gallery-h": `${numerics.galleryHeight}px`,
    "--cards-visible": String(numerics.desktopCardsVisible),
  };

  return vars as CSSProperties;
}

export function resolveSectionLayout(layout: SectionLayoutSettings | null | undefined) {
  const textAlignment = layout?.textAlignment ?? "left";

  return {
    sectionPadding: "pt-[var(--section-pt)] pb-[var(--section-pb)]",
    contentWidth: "w-full mx-auto max-w-[var(--content-max-w)]",
    textAlignment: alignClasses[textAlignment],
    textMaxWidth: "max-w-[var(--text-max-w)]",
    imageAspect:
      "relative w-full overflow-hidden rounded-sm border border-border h-[var(--image-h)] min-h-[var(--image-h)] max-h-[var(--image-h)]",
  };
}

export function defaultLayoutForSectionType(sectionType: string): SectionLayoutSettings {
  if (sectionType === "HERO") {
    return {
      spacing: "normal",
      contentWidth: "normal",
      textAlignment: "center",
      imageAspect: "landscape",
      paddingTop: 0,
      paddingBottom: 0,
      contentWidthPx: 960,
      textMaxWidthPx: 640,
      imageHeight: 360,
      imageAspectRatio: 1.78,
    };
  }

  if (sectionType === "IMAGE_TEXT") {
    return {
      spacing: "normal",
      contentWidth: "normal",
      textAlignment: "left",
      imageAspect: "compact",
      imageSide: "left",
      paddingTop: 0,
      paddingBottom: 0,
      contentWidthPx: 960,
      textMaxWidthPx: 640,
      imageHeight: 320,
      imageAspectRatio: 1.33,
    };
  }

  if (sectionType === "TESTIMONIALS" || sectionType === "EVENTS") {
    return {
      spacing: "normal",
      contentWidth: "normal",
      textAlignment: "left",
      paddingTop: 0,
      paddingBottom: 0,
      contentWidthPx: 1120,
      cardWidth: 300,
      desktopCardsVisible: 3,
    };
  }

  if (sectionType === "GALLERY") {
    return {
      spacing: "normal",
      contentWidth: "wide",
      textAlignment: "left",
      paddingTop: 0,
      paddingBottom: 0,
      contentWidthPx: 1120,
      galleryHeight: 220,
      cardWidth: 280,
      desktopCardsVisible: 4,
    };
  }

  if (sectionType === "CONTACT") {
    return {
      spacing: "normal",
      contentWidth: "normal",
      textAlignment: "left",
      paddingTop: 0,
      paddingBottom: 0,
      contentWidthPx: 960,
      textMaxWidthPx: 640,
    };
  }

  return {
    spacing: "normal",
    contentWidth: "normal",
    textAlignment: "left",
    paddingTop: 0,
    paddingBottom: 0,
    contentWidthPx: 960,
    textMaxWidthPx: 640,
  };
}

export function resolveImageSide(
  layout: SectionLayoutSettings | null | undefined,
  sectionType = "IMAGE_TEXT",
  fallback?: SectionImageSide,
): SectionImageSide {
  if (layout?.imageSide === "left" || layout?.imageSide === "right") {
    return layout.imageSide;
  }
  if (fallback) return fallback;
  return defaultLayoutForSectionType(sectionType).imageSide ?? "left";
}

export function mergeLayoutSettings(
  base: SectionLayoutSettings | null | undefined,
  sectionType: string,
): SectionLayoutSettings {
  const merged = {
    ...defaultLayoutForSectionType(sectionType),
    ...(base ?? {}),
  };
  const numerics = resolveLayoutNumerics(merged, sectionType, base);

  return clampLayoutSettings({
    ...merged,
    ...numerics,
  });
}

export function cardWidthFromVisibleCount(visible: number, containerWidth = 1120) {
  const clamped = clampValue(Math.round(visible), "desktopCardsVisible");
  const gap = 24;
  const width = Math.floor((containerWidth - gap * (clamped - 1)) / clamped);
  return clampValue(width, "cardWidth");
}
