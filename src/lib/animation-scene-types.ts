// Behavioral knobs for the About page river animation.
//
// Speed settings (RiverSceneSpeedSettings) are admin-editable, stored on
// AnimationScene.draftConfig and controlled from /admin/animations - this is
// the "speed controls" the project owner asked to be able to tune themselves
// instead of waiting on a code change each time.
//
// Layout (placement/widthPx/opacity) stays developer-controlled for now, per
// the earlier decision not to build a full animation editor.

export type RiverSceneSpeedSettings = {
  /** Ambient background-position shift, in px per second, while the visitor is stationary. Keep this small. */
  speedAmbient: number;
  /** How strongly scroll velocity accelerates the flow above ambient - keep gentle ("slightly faster", not a blur). */
  scrollMultiplier: number;
  /** Hard cap on the speed multiplier relative to speedAmbient, however fast the visitor scrolls. */
  speedMax: number;
  direction: "downstream" | "upstream";
};

export type RiverSceneConfig = RiverSceneSpeedSettings & {
  placement: {
    /** Below this viewport width the river narrows/fades toward the compact treatment. */
    desktopMinWidthPx: number;
  };
  /** River column width in px at full (desktop) scale. Height is derived from the
   *  artwork's native 1:4 aspect ratio - never set independently of width. */
  widthPx: number;
  opacity: number;
};

export const DEFAULT_RIVER_SPEED_SETTINGS: RiverSceneSpeedSettings = {
  speedAmbient: 6,
  scrollMultiplier: 0.9,
  speedMax: 2.4,
  direction: "downstream",
};

export const DEFAULT_RIVER_SCENE_CONFIG: RiverSceneConfig = {
  placement: {
    desktopMinWidthPx: 1280,
  },
  widthPx: 64,
  opacity: 0.85,
  ...DEFAULT_RIVER_SPEED_SETTINGS,
};

const SPEED_RANGES = {
  speedAmbient: { min: 1, max: 40 },
  scrollMultiplier: { min: 0, max: 5 },
  speedMax: { min: 1, max: 10 },
} as const;

export function clampNumber(value: unknown, fallback: number, min: number, max: number): number {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(max, Math.max(min, numeric));
}

/** Defensive JSON parse for AnimationScene.draftConfig, mirroring the parseSiteBranding pattern. */
export function parseRiverSpeedSettings(value: unknown): RiverSceneSpeedSettings {
  if (!value || typeof value !== "object") return { ...DEFAULT_RIVER_SPEED_SETTINGS };
  const record = value as Record<string, unknown>;
  return {
    speedAmbient: clampNumber(
      record.speedAmbient,
      DEFAULT_RIVER_SPEED_SETTINGS.speedAmbient,
      SPEED_RANGES.speedAmbient.min,
      SPEED_RANGES.speedAmbient.max,
    ),
    scrollMultiplier: clampNumber(
      record.scrollMultiplier,
      DEFAULT_RIVER_SPEED_SETTINGS.scrollMultiplier,
      SPEED_RANGES.scrollMultiplier.min,
      SPEED_RANGES.scrollMultiplier.max,
    ),
    speedMax: clampNumber(
      record.speedMax,
      DEFAULT_RIVER_SPEED_SETTINGS.speedMax,
      SPEED_RANGES.speedMax.min,
      SPEED_RANGES.speedMax.max,
    ),
    direction: record.direction === "upstream" ? "upstream" : "downstream",
  };
}

// Per-page scroll-morph decorative figures - admin-editable image list
// (add/delete/reorder), horizontal placement, opacity, and an optional colour
// tint. Stored on the same AnimationScene.draftConfig JSON field, one scene row
// per page (pageTypes: ["YOGA"] / ["HEALING"] / ["JUST_ART_LIFE"]), separate
// from the About page's river scene.

export type ScrollFigureImage = {
  id: string;
  url: string;
  order: number;
};

export type ScrollFiguresSceneConfig = {
  images: ScrollFigureImage[];
  /** Position along the horizontal track: -50 = flush left edge, 0 = centered, 50 = flush right edge. */
  horizontalOffsetPercent: number;
  /** Base translucency of the figure layer. */
  opacity: number;
  /** Hex colour tinting the figures via a CSS mask (preserves each pose's alpha shape); null = original artwork colours. */
  tintColor: string | null;
};

export const SCROLL_FIGURES_OFFSET_RANGE = { min: -50, max: 50 } as const;
export const SCROLL_FIGURES_OPACITY_RANGE = { min: 0.05, max: 0.6 } as const;
export const SCROLL_FIGURES_DEFAULT_OPACITY = 0.16;

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

export const DEFAULT_YOGA_SCROLL_FIGURES_IMAGES: ScrollFigureImage[] = Array.from(
  { length: 20 },
  (_, index) => ({
    id: `default-${index + 1}`,
    url: `/yoga-figures/pose-${String(index + 1).padStart(2, "0")}.webp`,
    order: index,
  }),
);

export const EMPTY_SCROLL_FIGURES_CONFIG: ScrollFiguresSceneConfig = {
  images: [],
  horizontalOffsetPercent: 0,
  opacity: SCROLL_FIGURES_DEFAULT_OPACITY,
  tintColor: null,
};

export const DEFAULT_YOGA_SCROLL_FIGURES_CONFIG: ScrollFiguresSceneConfig = {
  ...EMPTY_SCROLL_FIGURES_CONFIG,
  images: DEFAULT_YOGA_SCROLL_FIGURES_IMAGES,
};

function parseScrollFigureImages(value: unknown): ScrollFigureImage[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry, index): ScrollFigureImage | null => {
      if (!entry || typeof entry !== "object") return null;
      const record = entry as Record<string, unknown>;
      const url = typeof record.url === "string" && record.url ? record.url : null;
      if (!url) return null;
      const id = typeof record.id === "string" && record.id ? record.id : `img-${index}`;
      const order = typeof record.order === "number" ? record.order : index;
      return { id, url, order };
    })
    .filter((image): image is ScrollFigureImage => image !== null)
    .sort((a, b) => a.order - b.order)
    .map((image, index) => ({ ...image, order: index }));
}

function parseTintColor(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return HEX_COLOR_PATTERN.test(value) ? value : null;
}

/** Defensive JSON parse for AnimationScene.draftConfig. Missing/malformed data
 * defaults to empty/neutral values - which page (if any) should bootstrap with
 * starter artwork is a decision for the repository layer, not this parser. */
export function parseScrollFiguresConfig(value: unknown): ScrollFiguresSceneConfig {
  if (!value || typeof value !== "object") return { ...EMPTY_SCROLL_FIGURES_CONFIG };
  const record = value as Record<string, unknown>;
  return {
    images: parseScrollFigureImages(record.images),
    horizontalOffsetPercent: clampNumber(
      record.horizontalOffsetPercent,
      EMPTY_SCROLL_FIGURES_CONFIG.horizontalOffsetPercent,
      SCROLL_FIGURES_OFFSET_RANGE.min,
      SCROLL_FIGURES_OFFSET_RANGE.max,
    ),
    opacity: clampNumber(
      record.opacity,
      SCROLL_FIGURES_DEFAULT_OPACITY,
      SCROLL_FIGURES_OPACITY_RANGE.min,
      SCROLL_FIGURES_OPACITY_RANGE.max,
    ),
    tintColor: parseTintColor(record.tintColor),
  };
}
