import { z } from "zod";
import type { CSSProperties } from "react";
import type { PageType } from "@/lib/page-section-types";
import { SITE_FONT_IDS, type SiteFontId, resolveFontCssVariable } from "@/lib/site-fonts";

export const HEADER_ALIGNMENT_OPTIONS = ["left", "center", "right", "custom"] as const;
export const HERO_LOGO_ALIGNMENT_OPTIONS = ["left", "center", "right"] as const;

export type HeaderAlignment = (typeof HEADER_ALIGNMENT_OPTIONS)[number];
export type HeroLogoAlignment = (typeof HERO_LOGO_ALIGNMENT_OPTIONS)[number];

export type TypographyRole = "headings" | "body" | "navigation" | "buttons";

export type TypographyRoleSettings = {
  fontFamily: SiteFontId;
  fontWeight: string;
  color: string;
  fontSize?: string;
  letterSpacing?: string;
};

export type DesignTypographySettings = {
  headings: TypographyRoleSettings;
  body: TypographyRoleSettings;
  navigation: TypographyRoleSettings;
  buttons: TypographyRoleSettings;
};

export type DesignHeaderLayoutSettings = {
  logoWidthPx: number;
  logoHeightPx: number;
  leftOffsetPx: number;
  rightOffsetPx: number;
  headerGapPx: number;
  alignment: HeaderAlignment;
  customOffsetX: number;
};

export type DesignHeroLayoutSettings = {
  logoAlignment: HeroLogoAlignment;
};

export type DesignColorSettings = {
  primary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
};

export type DesignNavigationStyling = {
  linkColor: string;
  activeColor: string;
  hoverColor: string;
  /** When set, overrides the default header / navigation bar background. */
  backgroundColor?: string;
  /** When set, overrides the default header / navigation bar border. */
  borderColor?: string;
};

export type DesignSelectionStyling = {
  background: string;
  text: string;
};

export type DesignSettings = {
  typography: DesignTypographySettings;
  headerLayout: DesignHeaderLayoutSettings;
  heroLayout: DesignHeroLayoutSettings;
  colors: DesignColorSettings;
  navigationStyling: DesignNavigationStyling;
  selectionStyling: DesignSelectionStyling;
};

/** Partial design tokens — merged on top of global settings (page or section scope). */
export type DesignSettingsOverride = {
  typography?: Partial<{
    [K in TypographyRole]: Partial<TypographyRoleSettings>;
  }>;
  headerLayout?: Partial<DesignHeaderLayoutSettings>;
  heroLayout?: Partial<DesignHeroLayoutSettings>;
  colors?: Partial<DesignColorSettings>;
  navigationStyling?: Partial<DesignNavigationStyling>;
  selectionStyling?: Partial<DesignSelectionStyling>;
};

export type DesignSettingsSiteConfig = {
  designSettings?: DesignSettings | null;
  designSettingsByPage?: Partial<Record<PageType, DesignSettingsOverride>> | null;
};

const hexColor = z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Invalid hex color");
const fontId = z.enum(SITE_FONT_IDS);
const fontWeight = z.enum(["300", "400", "500", "600", "700"]);

const fontSizePx = z
  .string()
  .regex(/^\d{1,3}px$/, "Font size must be a pixel value like 16px")
  .refine((value) => {
    const numeric = Number.parseInt(value, 10);
    return numeric >= 10 && numeric <= 120;
  }, "Font size must be between 10px and 120px");

const typographyRoleSchema = z.object({
  fontFamily: fontId,
  fontWeight,
  color: hexColor,
  fontSize: fontSizePx.optional(),
  letterSpacing: z.string().min(1).optional(),
});

export const designSettingsSchema = z.object({
  typography: z.object({
    headings: typographyRoleSchema.extend({
      fontSize: fontSizePx,
    }),
    body: typographyRoleSchema.extend({
      fontSize: fontSizePx,
    }),
    navigation: typographyRoleSchema.extend({
      fontSize: fontSizePx,
      letterSpacing: z.string().min(1),
    }),
    buttons: typographyRoleSchema.extend({
      fontSize: fontSizePx,
    }),
  }),
  headerLayout: z.object({
    /** 0 = auto width (use brand logo scale). */
    logoWidthPx: z.number().min(0).max(320),
    /** 0 = use brand logo scale from Design settings → Header layout → Logo. */
    logoHeightPx: z.number().min(0).max(120),
    leftOffsetPx: z.number().min(0).max(120),
    rightOffsetPx: z.number().min(0).max(120),
    headerGapPx: z.number().min(0).max(64),
    alignment: z.enum(HEADER_ALIGNMENT_OPTIONS),
    customOffsetX: z.number().min(-200).max(200),
  }),
  heroLayout: z.object({
    logoAlignment: z.enum(HERO_LOGO_ALIGNMENT_OPTIONS),
  }),
  colors: z.object({
    primary: hexColor,
    accent: hexColor,
    background: hexColor,
    foreground: hexColor,
    muted: hexColor,
  }),
  navigationStyling: z.object({
    linkColor: hexColor,
    activeColor: hexColor,
    hoverColor: hexColor,
    backgroundColor: hexColor.optional(),
    borderColor: hexColor.optional(),
  }),
  selectionStyling: z.object({
    background: hexColor,
    text: hexColor,
  }),
});

export const FONT_SIZE_PX_MIN = 10;
export const FONT_SIZE_PX_MAX = 120;

/** Parse a typography size into a clamped px string (10–120). */
export function parseFontSizePx(value: unknown, fallback: string): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    const clamped = Math.min(FONT_SIZE_PX_MAX, Math.max(FONT_SIZE_PX_MIN, Math.round(value)));
    return `${clamped}px`;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    const remMatch = trimmed.match(/^(\d+(?:\.\d+)?)rem$/);
    if (remMatch) {
      const px = Math.round(Number.parseFloat(remMatch[1]!) * 16);
      const clamped = Math.min(FONT_SIZE_PX_MAX, Math.max(FONT_SIZE_PX_MIN, px));
      return `${clamped}px`;
    }

    const match = trimmed.match(/^(\d{1,3})(px)?$/);
    if (match) {
      const clamped = Math.min(
        FONT_SIZE_PX_MAX,
        Math.max(FONT_SIZE_PX_MIN, Number.parseInt(match[1]!, 10)),
      );
      return `${clamped}px`;
    }
  }

  return fallback;
}

export function fontSizePxToNumber(value: string | undefined): number {
  if (!value) return FONT_SIZE_PX_MIN;
  const match = value.match(/^(\d{1,3})px$/);
  return match ? Number.parseInt(match[1]!, 10) : FONT_SIZE_PX_MIN;
}

export const DEFAULT_DESIGN_SETTINGS: DesignSettings = {
  typography: {
    headings: {
      fontFamily: "cormorant-garamond",
      fontWeight: "500",
      color: "#2a241f",
      fontSize: "52px",
    },
    body: {
      fontFamily: "dm-sans",
      fontWeight: "400",
      color: "#2a241f",
      fontSize: "16px",
    },
    navigation: {
      fontFamily: "dm-sans",
      fontWeight: "500",
      color: "#6b5f56",
      fontSize: "14px",
      letterSpacing: "0.01em",
    },
    buttons: {
      fontFamily: "dm-sans",
      fontWeight: "600",
      color: "#2a241f",
      fontSize: "14px",
    },
  },
  headerLayout: {
    logoWidthPx: 0,
    logoHeightPx: 0,
    leftOffsetPx: 0,
    rightOffsetPx: 0,
    headerGapPx: 8,
    alignment: "left",
    customOffsetX: 0,
  },
  heroLayout: {
    logoAlignment: "center",
  },
  colors: {
    primary: "#c47a5a",
    accent: "#5c6b52",
    background: "#f5f0e8",
    foreground: "#2a241f",
    muted: "#6b5f56",
  },
  navigationStyling: {
    linkColor: "#6b5f56",
    activeColor: "#2a241f",
    hoverColor: "#2a241f",
  },
  selectionStyling: {
    background: "#d97745",
    text: "#ffffff",
  },
};

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function clampHeaderLayout(layout: DesignHeaderLayoutSettings): DesignHeaderLayoutSettings {
  return {
    logoWidthPx: clampNumber(layout.logoWidthPx, 0, 320, 0),
    logoHeightPx: clampNumber(layout.logoHeightPx, 0, 120, 0),
    leftOffsetPx: clampNumber(layout.leftOffsetPx, 0, 120, 0),
    rightOffsetPx: clampNumber(layout.rightOffsetPx, 0, 120, 0),
    headerGapPx: clampNumber(layout.headerGapPx, 0, 64, 8),
    alignment: HEADER_ALIGNMENT_OPTIONS.includes(layout.alignment)
      ? layout.alignment
      : "left",
    customOffsetX: clampNumber(layout.customOffsetX, -200, 200, 0),
  };
}

function mergeTypographyRole(
  defaults: TypographyRoleSettings,
  value: unknown,
): TypographyRoleSettings {
  if (!value || typeof value !== "object") return { ...defaults };
  const record = value as Record<string, unknown>;
  return {
    fontFamily:
      typeof record.fontFamily === "string" && SITE_FONT_IDS.includes(record.fontFamily as SiteFontId)
        ? (record.fontFamily as SiteFontId)
        : defaults.fontFamily,
    fontWeight:
      typeof record.fontWeight === "string" ? record.fontWeight : defaults.fontWeight,
    color: typeof record.color === "string" ? record.color : defaults.color,
    fontSize:
      record.fontSize !== undefined
        ? parseFontSizePx(record.fontSize, defaults.fontSize ?? "16px")
        : defaults.fontSize,
    letterSpacing:
      typeof record.letterSpacing === "string" ? record.letterSpacing : defaults.letterSpacing,
  };
}

export function parseDesignSettings(value: unknown): DesignSettings {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return JSON.parse(JSON.stringify(DEFAULT_DESIGN_SETTINGS)) as DesignSettings;
  }

  const record = value as Record<string, unknown>;
  const typography = (record.typography ?? {}) as Record<string, unknown>;
  const headerLayout = (record.headerLayout ?? {}) as Record<string, unknown>;
  const heroLayout = (record.heroLayout ?? {}) as Record<string, unknown>;
  const colors = (record.colors ?? {}) as Record<string, unknown>;
  const navigationStyling = (record.navigationStyling ?? {}) as Record<string, unknown>;
  const selectionStyling = (record.selectionStyling ?? {}) as Record<string, unknown>;

  const parsed: DesignSettings = {
    typography: {
      headings: {
        ...mergeTypographyRole(DEFAULT_DESIGN_SETTINGS.typography.headings, typography.headings),
        fontSize: parseFontSizePx(
          (typography.headings as Record<string, unknown> | undefined)?.fontSize,
          DEFAULT_DESIGN_SETTINGS.typography.headings.fontSize!,
        ),
      },
      body: {
        ...mergeTypographyRole(DEFAULT_DESIGN_SETTINGS.typography.body, typography.body),
        fontSize: parseFontSizePx(
          (typography.body as Record<string, unknown> | undefined)?.fontSize,
          DEFAULT_DESIGN_SETTINGS.typography.body.fontSize!,
        ),
      },
      navigation: {
        ...mergeTypographyRole(
          DEFAULT_DESIGN_SETTINGS.typography.navigation,
          typography.navigation,
        ),
        fontSize: parseFontSizePx(
          (typography.navigation as Record<string, unknown> | undefined)?.fontSize,
          DEFAULT_DESIGN_SETTINGS.typography.navigation.fontSize!,
        ),
        letterSpacing:
          typeof (typography.navigation as Record<string, unknown> | undefined)?.letterSpacing ===
          "string"
            ? ((typography.navigation as Record<string, unknown>).letterSpacing as string)
            : DEFAULT_DESIGN_SETTINGS.typography.navigation.letterSpacing!,
      },
      buttons: {
        ...mergeTypographyRole(DEFAULT_DESIGN_SETTINGS.typography.buttons, typography.buttons),
        fontSize: parseFontSizePx(
          (typography.buttons as Record<string, unknown> | undefined)?.fontSize,
          DEFAULT_DESIGN_SETTINGS.typography.buttons.fontSize!,
        ),
      },
    },
    headerLayout: {
      logoWidthPx:
        typeof headerLayout.logoWidthPx === "number"
          ? headerLayout.logoWidthPx
          : DEFAULT_DESIGN_SETTINGS.headerLayout.logoWidthPx,
      logoHeightPx:
        typeof headerLayout.logoHeightPx === "number"
          ? headerLayout.logoHeightPx
          : DEFAULT_DESIGN_SETTINGS.headerLayout.logoHeightPx,
      leftOffsetPx:
        typeof headerLayout.leftOffsetPx === "number"
          ? headerLayout.leftOffsetPx
          : DEFAULT_DESIGN_SETTINGS.headerLayout.leftOffsetPx,
      rightOffsetPx:
        typeof headerLayout.rightOffsetPx === "number"
          ? headerLayout.rightOffsetPx
          : DEFAULT_DESIGN_SETTINGS.headerLayout.rightOffsetPx,
      headerGapPx:
        typeof headerLayout.headerGapPx === "number"
          ? headerLayout.headerGapPx
          : DEFAULT_DESIGN_SETTINGS.headerLayout.headerGapPx,
      alignment:
        HEADER_ALIGNMENT_OPTIONS.includes(headerLayout.alignment as HeaderAlignment)
          ? (headerLayout.alignment as HeaderAlignment)
          : DEFAULT_DESIGN_SETTINGS.headerLayout.alignment,
      customOffsetX:
        typeof headerLayout.customOffsetX === "number"
          ? headerLayout.customOffsetX
          : DEFAULT_DESIGN_SETTINGS.headerLayout.customOffsetX,
    },
    heroLayout: {
      logoAlignment: HERO_LOGO_ALIGNMENT_OPTIONS.includes(
        heroLayout.logoAlignment as HeroLogoAlignment,
      )
        ? (heroLayout.logoAlignment as HeroLogoAlignment)
        : DEFAULT_DESIGN_SETTINGS.heroLayout.logoAlignment,
    },
    colors: {
      primary:
        typeof colors.primary === "string" ? colors.primary : DEFAULT_DESIGN_SETTINGS.colors.primary,
      accent:
        typeof colors.accent === "string" ? colors.accent : DEFAULT_DESIGN_SETTINGS.colors.accent,
      background:
        typeof colors.background === "string"
          ? colors.background
          : DEFAULT_DESIGN_SETTINGS.colors.background,
      foreground:
        typeof colors.foreground === "string"
          ? colors.foreground
          : DEFAULT_DESIGN_SETTINGS.colors.foreground,
      muted:
        typeof colors.muted === "string" ? colors.muted : DEFAULT_DESIGN_SETTINGS.colors.muted,
    },
    navigationStyling: {
      linkColor:
        typeof navigationStyling.linkColor === "string"
          ? navigationStyling.linkColor
          : DEFAULT_DESIGN_SETTINGS.navigationStyling.linkColor,
      activeColor:
        typeof navigationStyling.activeColor === "string"
          ? navigationStyling.activeColor
          : DEFAULT_DESIGN_SETTINGS.navigationStyling.activeColor,
      hoverColor:
        typeof navigationStyling.hoverColor === "string"
          ? navigationStyling.hoverColor
          : DEFAULT_DESIGN_SETTINGS.navigationStyling.hoverColor,
      backgroundColor:
        typeof navigationStyling.backgroundColor === "string"
          ? navigationStyling.backgroundColor
          : undefined,
      borderColor:
        typeof navigationStyling.borderColor === "string"
          ? navigationStyling.borderColor
          : undefined,
    },
    selectionStyling: {
      background:
        typeof selectionStyling.background === "string"
          ? selectionStyling.background
          : DEFAULT_DESIGN_SETTINGS.selectionStyling.background,
      text:
        typeof selectionStyling.text === "string"
          ? selectionStyling.text
          : DEFAULT_DESIGN_SETTINGS.selectionStyling.text,
    },
  };

  parsed.headerLayout = clampHeaderLayout(parsed.headerLayout);
  try {
    return designSettingsSchema.parse(parsed);
  } catch {
    return JSON.parse(JSON.stringify(DEFAULT_DESIGN_SETTINGS)) as DesignSettings;
  }
}

export function parseDesignSettingsOverride(value: unknown): DesignSettingsOverride | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  return value as DesignSettingsOverride;
}

export function parseDesignSettingsByPage(
  value: unknown,
): Partial<Record<PageType, DesignSettingsOverride>> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  const result: Partial<Record<PageType, DesignSettingsOverride>> = {};

  for (const pageType of ["YOGA", "HEALING", "JUST_ART_LIFE", "ABOUT"] as const) {
    const override = parseDesignSettingsOverride(record[pageType]);
    if (override) {
      result[pageType] = override;
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

function mergeTypographyRoleSettings(
  base: TypographyRoleSettings,
  override?: Partial<TypographyRoleSettings>,
): TypographyRoleSettings {
  if (!override) return base;
  return {
    fontFamily:
      override.fontFamily && SITE_FONT_IDS.includes(override.fontFamily)
        ? override.fontFamily
        : base.fontFamily,
    fontWeight: override.fontWeight ?? base.fontWeight,
    color: override.color ?? base.color,
    fontSize:
      override.fontSize !== undefined
        ? parseFontSizePx(override.fontSize, base.fontSize ?? "16px")
        : base.fontSize,
    letterSpacing: override.letterSpacing ?? base.letterSpacing,
  };
}

/** Layer overrides on global settings — page/section scope wins when set. */
export function mergeDesignSettings(
  base: DesignSettings,
  ...overrides: Array<DesignSettingsOverride | null | undefined>
): DesignSettings {
  let result: DesignSettings = parseDesignSettings(base);

  for (const override of overrides) {
    if (!override) continue;

    if (override.typography) {
      const roles = Object.keys(override.typography) as TypographyRole[];
      for (const role of roles) {
        const roleOverride = override.typography[role];
        if (!roleOverride) continue;
        result = {
          ...result,
          typography: {
            ...result.typography,
            [role]: mergeTypographyRoleSettings(result.typography[role], roleOverride),
          },
        };
      }
    }

    if (override.headerLayout) {
      result = {
        ...result,
        headerLayout: clampHeaderLayout({ ...result.headerLayout, ...override.headerLayout }),
      };
    }

    if (override.heroLayout) {
      result = {
        ...result,
        heroLayout: { ...result.heroLayout, ...override.heroLayout },
      };
    }

    if (override.colors) {
      result = {
        ...result,
        colors: { ...result.colors, ...override.colors },
      };
    }

    if (override.navigationStyling) {
      result = {
        ...result,
        navigationStyling: { ...result.navigationStyling, ...override.navigationStyling },
      };
    }

    if (override.selectionStyling) {
      result = {
        ...result,
        selectionStyling: { ...result.selectionStyling, ...override.selectionStyling },
      };
    }
  }

  return parseDesignSettings(result);
}

export function resolvePageDesignSettings(
  site: DesignSettingsSiteConfig,
  pageType: PageType,
  sectionOverride?: DesignSettingsOverride | null,
): DesignSettings {
  const global = parseDesignSettings(site.designSettings ?? null);
  const pageOverride = site.designSettingsByPage?.[pageType];
  return mergeDesignSettings(global, pageOverride, sectionOverride);
}

export function designSettingsToCssVariables(settings: DesignSettings): CSSProperties {
  const { typography: t, colors: c, navigationStyling: n } = settings;

  return {
    "--background": c.background,
    "--foreground": c.foreground,
    "--muted": c.muted,
    "--primary": c.primary,
    "--accent": c.accent,
    "--ds-font-heading": resolveFontCssVariable(t.headings.fontFamily),
    "--ds-font-body": resolveFontCssVariable(t.body.fontFamily),
    "--ds-font-nav": resolveFontCssVariable(t.navigation.fontFamily),
    "--ds-font-button": resolveFontCssVariable(t.buttons.fontFamily),
    "--ds-weight-heading": t.headings.fontWeight,
    "--ds-weight-body": t.body.fontWeight,
    "--ds-weight-nav": t.navigation.fontWeight,
    "--ds-weight-button": t.buttons.fontWeight,
    "--ds-color-heading": t.headings.color,
    "--ds-color-body": t.body.color,
    "--ds-color-button": t.buttons.color,
    "--ds-size-heading": t.headings.fontSize ?? "52px",
    "--ds-size-body": t.body.fontSize ?? "16px",
    "--ds-size-nav": t.navigation.fontSize ?? "14px",
    "--ds-size-button": t.buttons.fontSize ?? "14px",
    "--ds-tracking-nav": t.navigation.letterSpacing ?? "0.01em",
    "--ds-nav-link": n.linkColor,
    "--ds-nav-active": n.activeColor,
    "--ds-nav-hover": n.hoverColor,
    ...(n.backgroundColor ? { "--ds-nav-header-bg": n.backgroundColor } : {}),
    ...(n.borderColor ? { "--ds-nav-header-border": n.borderColor } : {}),
    "--ds-selection-bg": settings.selectionStyling.background,
    "--ds-selection-text": settings.selectionStyling.text,
  } as CSSProperties;
}

export const HEADER_ALIGNMENT_LABELS: Record<HeaderAlignment, string> = {
  left: "Left",
  center: "Center",
  right: "Right",
  custom: "Custom",
};

export const HERO_LOGO_ALIGNMENT_LABELS: Record<HeroLogoAlignment, string> = {
  left: "Left",
  center: "Center",
  right: "Right",
};
