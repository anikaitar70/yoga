import { parseSiteBranding } from "@/lib/site-branding";

export function jaaLogoFromUnknown(value: unknown): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const jaa = (value as Record<string, unknown>).justArtAffaire;
  if (!jaa || typeof jaa !== "object" || Array.isArray(jaa)) {
    return null;
  }

  const logoSrc = (jaa as Record<string, unknown>).logoSrc;
  return typeof logoSrc === "string" ? logoSrc : null;
}

export function jaaLogoFromParsed(value: unknown): string {
  return parseSiteBranding(value).justArtAffaire.logoSrc;
}

/** Structured branding traces — visible via `docker compose logs app`. */
export function logBrandingTrace(
  stage: string,
  details: Record<string, unknown>,
): void {
  console.info(
    "[branding]",
    JSON.stringify({
      stage,
      at: new Date().toISOString(),
      ...details,
    }),
  );
}
