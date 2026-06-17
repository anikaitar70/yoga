export type BrandKey = "nirvanaYoga" | "justArtAffaire";

export type BrandLogoConfig = {
  logoSrc: string;
  /** Multiplier applied to context base height (0.5–2.0). */
  logoScale: number;
};

export type SiteBranding = Record<BrandKey, BrandLogoConfig>;

export const BRAND_LABELS: Record<BrandKey, string> = {
  nirvanaYoga: "Nirvana Yoga",
  justArtAffaire: "Just Art Affaire",
};

export const DEFAULT_LOGO_SRC: Record<BrandKey, string> = {
  nirvanaYoga: "/brand/nirvana-yoga-logo.png",
  justArtAffaire: "/brand/just-art-affaire-logo.svg",
};

export const DEFAULT_SITE_BRANDING: SiteBranding = {
  nirvanaYoga: { logoSrc: DEFAULT_LOGO_SRC.nirvanaYoga, logoScale: 1 },
  justArtAffaire: { logoSrc: DEFAULT_LOGO_SRC.justArtAffaire, logoScale: 1 },
};

export type BrandLogoContext = "navbar" | "footer" | "hero" | "admin";

/** Base logo heights in rem before CMS scale is applied. */
export const BRAND_LOGO_BASE_HEIGHT_REM: Record<BrandLogoContext, number> = {
  navbar: 2.5,
  footer: 3,
  hero: 2.75,
  admin: 2.5,
};

const MIN_SCALE = 0.5;
const MAX_SCALE = 2;

function clampScale(value: unknown): number {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return 1;
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, numeric));
}

function parseBrandEntry(
  key: BrandKey,
  value: unknown,
): BrandLogoConfig {
  if (!value || typeof value !== "object") {
    return { ...DEFAULT_SITE_BRANDING[key] };
  }

  const record = value as Record<string, unknown>;
  const logoSrc =
    typeof record.logoSrc === "string" && record.logoSrc.trim()
      ? record.logoSrc.trim()
      : DEFAULT_SITE_BRANDING[key].logoSrc;

  return {
    logoSrc,
    logoScale: clampScale(record.logoScale),
  };
}

export function parseSiteBranding(value: unknown): SiteBranding {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      nirvanaYoga: { ...DEFAULT_SITE_BRANDING.nirvanaYoga },
      justArtAffaire: { ...DEFAULT_SITE_BRANDING.justArtAffaire },
    };
  }

  const record = value as Record<string, unknown>;
  return {
    nirvanaYoga: parseBrandEntry("nirvanaYoga", record.nirvanaYoga),
    justArtAffaire: parseBrandEntry("justArtAffaire", record.justArtAffaire),
  };
}

export function resolveBrandLogoHeightRem(
  context: BrandLogoContext,
  scale: number,
): number {
  return BRAND_LOGO_BASE_HEIGHT_REM[context] * clampScale(scale);
}
