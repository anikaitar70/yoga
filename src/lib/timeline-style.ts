import type { CSSProperties } from "react";
import type { PageType } from "@/lib/page-section-types";

/** Optional timeline typography and color tokens — all fields inherit from defaults when omitted. */
export type TimelineStyleSettings = {
  numberColor?: string;
  titleColor?: string;
  textColor?: string;
  numberFont?: string;
  titleFont?: string;
  textFont?: string;
  lineColor?: string;
  dotColor?: string;
  numberWeight?: string;
  titleWeight?: string;
  textWeight?: string;
  numberSize?: string;
  titleSize?: string;
  textSize?: string;
};

export const TIMELINE_STYLE_SCOPES = ["section", "page", "site"] as const;
export type TimelineStyleScope = (typeof TIMELINE_STYLE_SCOPES)[number];

export const TIMELINE_STYLE_SCOPE_LABELS: Record<TimelineStyleScope, string> = {
  section: "This timeline only",
  page: "All timeline sections on this page",
  site: "All timeline sections site-wide",
};

export const TIMELINE_FONT_OPTIONS = [
  { value: "display", label: "Display (Cormorant)" },
  { value: "sans", label: "Body (DM Sans)" },
  { value: "handwritten", label: "Handwritten (Caveat)" },
] as const;

export const TIMELINE_WEIGHT_OPTIONS = [
  { value: "400", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semibold" },
  { value: "700", label: "Bold" },
] as const;

export const TIMELINE_SIZE_OPTIONS = [
  { value: "xs", label: "Extra small" },
  { value: "sm", label: "Small" },
  { value: "base", label: "Base" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Extra large" },
  { value: "2xl", label: "2× large" },
  { value: "3xl", label: "3× large" },
  { value: "4xl", label: "4× large" },
] as const;

export type TimelineStyleSiteConfig = {
  timelineStyleDefaults?: TimelineStyleSettings | null;
  timelineStyleByPage?: Partial<Record<PageType, TimelineStyleSettings>> | null;
};

/** Nirvana-branded defaults — higher contrast than previous primary-soft numbers. */
export const DEFAULT_TIMELINE_STYLE: Required<TimelineStyleSettings> = {
  numberColor: "var(--primary)",
  titleColor: "var(--foreground)",
  textColor: "var(--foreground)",
  numberFont: "display",
  titleFont: "display",
  textFont: "sans",
  lineColor: "color-mix(in srgb, var(--primary) 35%, transparent)",
  dotColor: "var(--primary)",
  numberWeight: "600",
  titleWeight: "500",
  textWeight: "400",
  numberSize: "3xl",
  titleSize: "xl",
  textSize: "base",
};

const FONT_FAMILY_MAP: Record<string, string> = {
  display: "var(--font-display), ui-serif, Georgia, serif",
  sans: "var(--font-sans), ui-sans-serif, system-ui, sans-serif",
  handwritten: "var(--font-handwritten), cursive",
};

const SIZE_MAP: Record<string, string> = {
  xs: "0.75rem",
  sm: "0.875rem",
  base: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  "3xl": "1.875rem",
  "4xl": "2.25rem",
};

export function formatTimelineSequenceNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}

export function isTimelineVariant(
  variant: string | undefined,
): variant is "art-journey" | "experience-timeline" {
  return variant === "art-journey" || variant === "experience-timeline";
}

export function mergeTimelineStyle(
  ...layers: Array<TimelineStyleSettings | null | undefined>
): TimelineStyleSettings {
  const merged: TimelineStyleSettings = { ...DEFAULT_TIMELINE_STYLE };
  for (const layer of layers) {
    if (!layer) continue;
    for (const [key, value] of Object.entries(layer) as [keyof TimelineStyleSettings, string | undefined][]) {
      if (typeof value === "string" && value.trim()) {
        merged[key] = value.trim();
      }
    }
  }
  return merged;
}

function resolveFontFamily(token: string | undefined): string {
  if (!token) return FONT_FAMILY_MAP.display;
  if (token.startsWith("var(") || token.includes(",")) return token;
  return FONT_FAMILY_MAP[token] ?? token;
}

function resolveFontSize(token: string | undefined): string {
  if (!token) return SIZE_MAP.base;
  if (token.endsWith("rem") || token.endsWith("px") || token.endsWith("em")) return token;
  return SIZE_MAP[token] ?? token;
}

export function timelineStyleToCssVariables(
  style: TimelineStyleSettings | null | undefined,
): CSSProperties {
  const resolved = mergeTimelineStyle(style);

  return {
    ["--timeline-number-color" as string]: resolved.numberColor,
    ["--timeline-title-color" as string]: resolved.titleColor,
    ["--timeline-text-color" as string]: resolved.textColor,
    ["--timeline-line-color" as string]: resolved.lineColor,
    ["--timeline-dot-color" as string]: resolved.dotColor,
    ["--timeline-number-font" as string]: resolveFontFamily(resolved.numberFont),
    ["--timeline-title-font" as string]: resolveFontFamily(resolved.titleFont),
    ["--timeline-text-font" as string]: resolveFontFamily(resolved.textFont),
    ["--timeline-number-weight" as string]: resolved.numberWeight,
    ["--timeline-title-weight" as string]: resolved.titleWeight,
    ["--timeline-text-weight" as string]: resolved.textWeight,
    ["--timeline-number-size" as string]: resolveFontSize(resolved.numberSize),
    ["--timeline-title-size" as string]: resolveFontSize(resolved.titleSize),
    ["--timeline-text-size" as string]: resolveFontSize(resolved.textSize),
  };
}

export const TIMELINE_STYLE_CSS_CLASSES =
  "[--timeline-number-color:var(--primary)] [--timeline-title-color:var(--foreground)] [--timeline-text-color:var(--foreground)]";
