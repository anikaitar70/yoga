export const HERO_MEDIA_MODES = ["SINGLE", "ROTATING", "COLLAGE", "FEATURED_COLLECTION"] as const;

export type HeroMediaMode = (typeof HERO_MEDIA_MODES)[number];

export const HERO_MEDIA_MODE_LABELS: Record<HeroMediaMode, string> = {
  SINGLE: "Single image",
  ROTATING: "Rotating images",
  COLLAGE: "Collage",
  FEATURED_COLLECTION: "Featured collection",
};

export function isHeroMediaMode(value: string): value is HeroMediaMode {
  return (HERO_MEDIA_MODES as readonly string[]).includes(value);
}

export type HeroRotatingImage = {
  url: string;
  alt: string;
};
