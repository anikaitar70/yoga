import type { SocialLink } from "@/content/types";

/** Stored in SiteConfig.social — single source of truth for Instagram accounts. */
export type SiteSocialConfig = {
  nirvanaYogaInstagram: string;
  justArtAffaireInstagram: string;
};

export const DEFAULT_SOCIAL_CONFIG: SiteSocialConfig = {
  nirvanaYogaInstagram: "https://www.instagram.com/nirvanyog1/",
  justArtAffaireInstagram: "https://www.instagram.com/justartaffaire/",
};

const REMOVED_PLATFORMS = /youtube|pinterest/i;

function isLegacySocialArray(
  value: unknown,
): value is { label: string; href: string }[] {
  return Array.isArray(value);
}

function isStructuredSocial(value: unknown): value is SiteSocialConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.nirvanaYogaInstagram === "string" ||
    typeof record.justArtAffaireInstagram === "string"
  );
}

function instagramFromLegacy(
  links: { label: string; href: string }[],
  matcher: RegExp,
): string {
  const hit = links.find(
    (link) =>
      !REMOVED_PLATFORMS.test(link.label) &&
      !REMOVED_PLATFORMS.test(link.href) &&
      /instagram/i.test(link.href) &&
      matcher.test(link.label),
  );
  return hit?.href?.trim() ?? "";
}

/** Normalize DB JSON (legacy array or structured object) without breaking consumers. */
export function parseSiteSocialConfig(value: unknown): SiteSocialConfig {
  if (isStructuredSocial(value)) {
    return {
      nirvanaYogaInstagram:
        value.nirvanaYogaInstagram?.trim() || DEFAULT_SOCIAL_CONFIG.nirvanaYogaInstagram,
      justArtAffaireInstagram:
        value.justArtAffaireInstagram?.trim() ||
        DEFAULT_SOCIAL_CONFIG.justArtAffaireInstagram,
    };
  }

  if (isLegacySocialArray(value)) {
    const cleaned = value.filter(
      (link) =>
        link?.href &&
        !REMOVED_PLATFORMS.test(link.label ?? "") &&
        !REMOVED_PLATFORMS.test(link.href),
    );

    const nirvana =
      instagramFromLegacy(cleaned, /nirvana/i) ||
      cleaned.find((link) => /instagram/i.test(link.href))?.href?.trim() ||
      DEFAULT_SOCIAL_CONFIG.nirvanaYogaInstagram;

    const justArt =
      instagramFromLegacy(cleaned, /just\s*art/i) ||
      DEFAULT_SOCIAL_CONFIG.justArtAffaireInstagram;

    return {
      nirvanaYogaInstagram: nirvana,
      justArtAffaireInstagram: justArt,
    };
  }

  return { ...DEFAULT_SOCIAL_CONFIG };
}

/** Derived display links — Instagram-first, for Footer and contact surfaces. */
export function buildSocialLinks(config: SiteSocialConfig): SocialLink[] {
  const links: SocialLink[] = [];

  if (config.nirvanaYogaInstagram.trim()) {
    links.push({
      label: "Nirvana Yoga on Instagram",
      href: config.nirvanaYogaInstagram.trim(),
    });
  }

  if (config.justArtAffaireInstagram.trim()) {
    links.push({
      label: "Just Art Affaire on Instagram",
      href: config.justArtAffaireInstagram.trim(),
    });
  }

  return links;
}

export function primaryInstagramHref(config: SiteSocialConfig): string {
  return config.nirvanaYogaInstagram.trim() || config.justArtAffaireInstagram.trim();
}
