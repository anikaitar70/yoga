/** Max content widths for admin preview frames (not breakpoints — visual simulation). */
export const PREVIEW_VIEWPORT_WIDTHS = {
  desktop: null as number | null,
  tablet: 768,
  mobile: 390,
} as const;

/** Desktop preview canvas aspect ratio (width : height). */
export const PREVIEW_DESKTOP_ASPECT_RATIO = 18 / 9;

export type PreviewViewportMode = keyof typeof PREVIEW_VIEWPORT_WIDTHS;

export const PREVIEW_VIEWPORT_LABELS: Record<PreviewViewportMode, string> = {
  desktop: "Desktop",
  tablet: "Tablet",
  mobile: "Mobile",
};

export const PREVIEW_ZOOM_LEVELS = [0.5, 0.75, 1, "fit"] as const;
export type PreviewZoomLevel = (typeof PREVIEW_ZOOM_LEVELS)[number];

export const PREVIEW_ZOOM_LABELS: Record<PreviewZoomLevel, string> = {
  0.5: "50%",
  0.75: "75%",
  1: "100%",
  fit: "Fit Width",
};
