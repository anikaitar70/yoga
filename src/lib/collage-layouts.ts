export const COLLAGE_LAYOUTS = [
  "MASONRY",
  "STACKED",
  "ASYMMETRICAL_GRID",
  "HERO_SUPPORTING",
  "HORIZONTAL_STRIP",
  "FEATURED_SUPPORTING",
] as const;

export type CollageLayout = (typeof COLLAGE_LAYOUTS)[number];

export const COLLAGE_LAYOUT_LABELS: Record<CollageLayout, string> = {
  MASONRY: "Masonry grid",
  STACKED: "Stacked",
  ASYMMETRICAL_GRID: "Asymmetrical grid",
  HERO_SUPPORTING: "Hero + supporting images",
  HORIZONTAL_STRIP: "Horizontal strip",
  FEATURED_SUPPORTING: "Featured + supporting images",
};

export function isCollageLayout(value: string): value is CollageLayout {
  return (COLLAGE_LAYOUTS as readonly string[]).includes(value);
}

/** Max images per layout preset — keeps collages structured, not freeform. */
export const COLLAGE_LAYOUT_LIMITS: Record<CollageLayout, number> = {
  MASONRY: 12,
  STACKED: 6,
  ASYMMETRICAL_GRID: 8,
  HERO_SUPPORTING: 5,
  HORIZONTAL_STRIP: 8,
  FEATURED_SUPPORTING: 4,
};
