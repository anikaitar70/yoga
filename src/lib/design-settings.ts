import { z } from "zod";
import type { CSSProperties } from "react";
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
};

export type DesignSettings = {
  typography: DesignTypographySettings;
  headerLayout: DesignHeaderLayoutSettings;
  heroLayout: DesignHeroLayoutSettings;
  colors: DesignColorSettings;
  navigationStyling: DesignNavigationStyling;
};

const hexColor = z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Invalid hex color");
const fontId = z.enum(SITE_FONT_IDS);
const fontWeight = z.enum(["300", "400", "500", "600", "700"]);

const typographyRoleSchema = z.object({
  fontFamily: fontId,
  fontWeight,
  color: hexColor,
  fontSize: z.string().min(1).optional(),
  letterSpacing: z.string().min(1).optional(),
});

export const designSettingsSchema = z.object({
  typography: z.object({
    headings: typographyRoleSchema,
    body: typographyRoleSchema,
    navigation: typographyRoleSchema.extend({
      fontSize: z.string().min(1),
      letterSpacing: z.string().min(1),
    }),
    buttons: typographyRoleSchema.extend({
      fontSize: z.string().min(1),
    }),
  }),
  headerLayout: z.object({
    logoWidthPx: z.number().min(24).max(320),
    logoHeightPx: z.number().min(16).max(120),
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
  }),
});

export const DEFAULT_DESIGN_SETTINGS: DesignSettings = {
  typography: {
    headings: {
      fontFamily: "cormorant-garamond",
      fontWeight: "500",
      color: "#2a241f",
    },
    body: {
      fontFamily: "dm-sans",
      fontWeight: "400",
      color: "#2a241f",
    },
    navigation: {
      fontFamily: "dm-sans",
      fontWeight: "500",
      color: "#6b5f56",
      fontSize: "0.875rem",
      letterSpacing: "0.01em",
    },
    buttons: {
      fontFamily: "dm-sans",
      fontWeight: "600",
      color: "#2a241f",
      fontSize: "0.875rem",
    },
  },
  headerLayout: {
    logoWidthPx: 0,
    logoHeightPx: 40,
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
};

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
    fontSize: typeof record.fontSize === "string" ? record.fontSize : defaults.fontSize,
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

  const parsed: DesignSettings = {
    typography: {
      headings: mergeTypographyRole(DEFAULT_DESIGN_SETTINGS.typography.headings, typography.headings),
      body: mergeTypographyRole(DEFAULT_DESIGN_SETTINGS.typography.body, typography.body),
      navigation: {
        ...mergeTypographyRole(
          DEFAULT_DESIGN_SETTINGS.typography.navigation,
          typography.navigation,
        ),
        fontSize:
          typeof (typography.navigation as Record<string, unknown> | undefined)?.fontSize ===
          "string"
            ? ((typography.navigation as Record<string, unknown>).fontSize as string)
            : DEFAULT_DESIGN_SETTINGS.typography.navigation.fontSize!,
        letterSpacing:
          typeof (typography.navigation as Record<string, unknown> | undefined)?.letterSpacing ===
          "string"
            ? ((typography.navigation as Record<string, unknown>).letterSpacing as string)
            : DEFAULT_DESIGN_SETTINGS.typography.navigation.letterSpacing!,
      },
      buttons: {
        ...mergeTypographyRole(DEFAULT_DESIGN_SETTINGS.typography.buttons, typography.buttons),
        fontSize:
          typeof (typography.buttons as Record<string, unknown> | undefined)?.fontSize === "string"
            ? ((typography.buttons as Record<string, unknown>).fontSize as string)
            : DEFAULT_DESIGN_SETTINGS.typography.buttons.fontSize!,
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
    },
  };

  try {
    return designSettingsSchema.parse(parsed);
  } catch {
    return JSON.parse(JSON.stringify(DEFAULT_DESIGN_SETTINGS)) as DesignSettings;
  }
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
    "--ds-color-nav": t.navigation.color,
    "--ds-color-button": t.buttons.color,
    "--ds-size-nav": t.navigation.fontSize ?? "0.875rem",
    "--ds-size-button": t.buttons.fontSize ?? "0.875rem",
    "--ds-tracking-nav": t.navigation.letterSpacing ?? "0.01em",
    "--ds-nav-link": n.linkColor,
    "--ds-nav-active": n.activeColor,
    "--ds-nav-hover": n.hoverColor,
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
