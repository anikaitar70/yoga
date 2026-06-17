/** Max content widths for admin preview frames (not breakpoints — visual simulation). */
export const PREVIEW_VIEWPORT_WIDTHS = {
  desktop: null as number | null,
  tablet: 768,
  mobile: 390,
} as const;

export type PreviewViewportMode = keyof typeof PREVIEW_VIEWPORT_WIDTHS;

export const PREVIEW_VIEWPORT_LABELS: Record<PreviewViewportMode, string> = {
  desktop: "Desktop",
  tablet: "Tablet",
  mobile: "Mobile",
};
