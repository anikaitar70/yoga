export type BrandKey = "nirvanaYoga" | "justArtAffaire";

export type BrandLogoConfig = {
  logoSrc: string;
  /** Multiplier applied to context base height (0.5–4.0). */
  logoScale: number;
  /** Optional explicit height in px for hero display (overrides scale-derived height when set). */
  logoHeightPx?: number;
};

/** Free-form placement of the footer credentials logo as a background layer. */
export type CredentialsLogoPlacement = {
  /** Center point, percent of the footer content area's width (0-100). */
  xPercent: number;
  /** Center point, percent of the footer content area's height (0-100). */
  yPercent: number;
  /** Rendered width in px (height follows the image's natural aspect ratio). */
  widthPx: number;
};

export type SiteBranding = Record<BrandKey, BrandLogoConfig> & {
  /** Optional credentials/certification logo shown as a background layer in the footer. */
  credentialsLogoSrc?: string;
  credentialsLogoAlt?: string;
  /** Placement while the footer renders in its multi-column desktop layout (>=768px). */
  credentialsLogoDesktop?: CredentialsLogoPlacement;
  /** Placement while the footer is stacked into a single mobile column (<768px). */
  credentialsLogoMobile?: CredentialsLogoPlacement;
};

/** Approximates where the badge used to sit in normal flow, so turning on the new
 *  background-layer rendering doesn't visibly move it until an admin drags it. */
export const DEFAULT_CREDENTIALS_LOGO_PLACEMENT: Record<"desktop" | "mobile", CredentialsLogoPlacement> = {
  desktop: { xPercent: 7, yPercent: 32, widthPx: 140 },
  mobile: { xPercent: 22, yPercent: 7, widthPx: 120 },
};

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
const MAX_SCALE = 4;

function clampScale(value: unknown): number {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return 1;
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, numeric));
}

function clampHeightPx(value: unknown): number | undefined {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return undefined;
  return Math.min(640, Math.max(32, Math.round(numeric)));
}

function clampPercent(value: unknown, fallback: number): number {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(100, Math.max(0, numeric));
}

function clampLogoWidthPx(value: unknown, fallback: number): number {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(480, Math.max(24, Math.round(numeric)));
}

function parseCredentialsLogoPlacement(
  value: unknown,
  variant: "desktop" | "mobile",
): CredentialsLogoPlacement {
  const fallback = DEFAULT_CREDENTIALS_LOGO_PLACEMENT[variant];
  if (!value || typeof value !== "object") return { ...fallback };
  const record = value as Record<string, unknown>;
  return {
    xPercent: clampPercent(record.xPercent, fallback.xPercent),
    yPercent: clampPercent(record.yPercent, fallback.yPercent),
    widthPx: clampLogoWidthPx(record.widthPx, fallback.widthPx),
  };
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

  const heightPx = clampHeightPx(record.logoHeightPx);
  return {
    logoSrc,
    logoScale: clampScale(record.logoScale),
    ...(heightPx ? { logoHeightPx: heightPx } : {}),
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
  const credSrc =
    typeof record.credentialsLogoSrc === "string" && record.credentialsLogoSrc.trim()
      ? record.credentialsLogoSrc.trim()
      : typeof (record as Record<string, unknown>).credentialsLogo === "string" && String((record as Record<string, unknown>).credentialsLogo).trim()
        ? String((record as Record<string, unknown>).credentialsLogo).trim()
        : undefined;
  const credAlt =
    typeof record.credentialsLogoAlt === "string" && record.credentialsLogoAlt.trim()
      ? record.credentialsLogoAlt.trim()
      : undefined;
  return {
    nirvanaYoga: parseBrandEntry("nirvanaYoga", record.nirvanaYoga),
    justArtAffaire: parseBrandEntry("justArtAffaire", record.justArtAffaire),
    ...(credSrc
      ? {
          credentialsLogoSrc: credSrc,
          credentialsLogoDesktop: parseCredentialsLogoPlacement(record.credentialsLogoDesktop, "desktop"),
          credentialsLogoMobile: parseCredentialsLogoPlacement(record.credentialsLogoMobile, "mobile"),
        }
      : {}),
    ...(credAlt ? { credentialsLogoAlt: credAlt } : {}),
  };
}

export function resolveBrandLogoHeightRem(
  context: BrandLogoContext,
  scale: number,
  heightPx?: number,
): number {
  if (heightPx && heightPx > 0) return heightPx / 16;
  return BRAND_LOGO_BASE_HEIGHT_REM[context] * clampScale(scale);
}

export function resolveBrandLogoHeightPx(
  context: BrandLogoContext,
  config: BrandLogoConfig,
): number {
  if (config.logoHeightPx && config.logoHeightPx > 0) return config.logoHeightPx;
  return Math.round(resolveBrandLogoHeightRem(context, config.logoScale) * 16);
}

/** Uploaded assets should bypass Next image optimization (served from /uploads volume). */
export function shouldUnoptimizeLogoSrc(src: string): boolean {
  return src.startsWith("/uploads/") || src.endsWith(".svg");
}
