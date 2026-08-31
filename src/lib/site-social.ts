import type { SocialLink } from "@/content/types";

/** Stored in SiteConfig.social — single source of truth for Instagram, Facebook, YouTube. */
export type SiteSocialConfig = {
  nirvanaYogaInstagram: string;
  justArtAffaireInstagram: string;
  facebook?: string;
  youTube?: string;
  /** Editable display text — URL and label are independent. */
  nirvanaYogaInstagramLabel?: string;
  justArtAffaireInstagramLabel?: string;
  facebookLabel?: string;
  youTubeLabel?: string;
};

export const DEFAULT_SOCIAL_CONFIG: SiteSocialConfig = {
  nirvanaYogaInstagram: "https://www.instagram.com/nirvanyog1/",
  justArtAffaireInstagram: "https://www.instagram.com/justartaffaire/",
  facebook: "",
  youTube: "",
};

const REMOVED_PLATFORMS = /pinterest/i;

function isLegacySocialArray(
  value: unknown,
): value is { label: string; href: string }[] {
  return Array.isArray(value);
}

function normalizedSocialUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return trimmed;
}

function isStructuredSocial(value: unknown): value is SiteSocialConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.nirvanaYogaInstagram === "string" ||
    typeof record.justArtAffaireInstagram === "string" ||
    typeof record.facebook === "string" ||
    typeof record.youTube === "string" ||
    typeof record.youtube === "string"
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
    const record = value as Record<string, unknown>;
    const youTube =
      normalizedSocialUrl(record.youTube) || normalizedSocialUrl((record as Record<string, unknown>).youtube);
    const label = (key: string) => {
      const v = record[key];
      return typeof v === "string" && v.trim() ? v.trim() : undefined;
    };
    return {
      nirvanaYogaInstagram:
        value.nirvanaYogaInstagram?.trim() || DEFAULT_SOCIAL_CONFIG.nirvanaYogaInstagram,
      justArtAffaireInstagram:
        value.justArtAffaireInstagram?.trim() ||
        DEFAULT_SOCIAL_CONFIG.justArtAffaireInstagram,
      facebook: normalizedSocialUrl(record.facebook),
      youTube,
      nirvanaYogaInstagramLabel: label("nirvanaYogaInstagramLabel"),
      justArtAffaireInstagramLabel: label("justArtAffaireInstagramLabel"),
      facebookLabel: label("facebookLabel"),
      youTubeLabel: label("youTubeLabel"),
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

    const facebook =
      cleaned.find((link) => /facebook/i.test(link.href) || /facebook/i.test(link.label ?? ""))?.href?.trim() || "";
    const youTube =
      cleaned.find((link) => /youtube|youtu\.be/i.test(link.href) || /youtube/i.test(link.label ?? ""))?.href?.trim() || "";

    return {
      nirvanaYogaInstagram: nirvana,
      justArtAffaireInstagram: justArt,
      facebook,
      youTube,
    };
  }

  return { ...DEFAULT_SOCIAL_CONFIG };
}

/** Derived display links — Instagram, Facebook, YouTube. */
export function buildSocialLinks(config: SiteSocialConfig): SocialLink[] {
  const links: SocialLink[] = [];

  if (config.nirvanaYogaInstagram.trim()) {
    links.push({
      label: config.nirvanaYogaInstagramLabel?.trim() || "Nirvana Yoga on Instagram",
      href: config.nirvanaYogaInstagram.trim(),
    });
  }

  if (config.justArtAffaireInstagram.trim()) {
    links.push({
      label: config.justArtAffaireInstagramLabel?.trim() || "Just Art Affaire on Instagram",
      href: config.justArtAffaireInstagram.trim(),
    });
  }

  if (config.facebook?.trim()) {
    links.push({
      label: config.facebookLabel?.trim() || "Nirvana Yoga on Facebook",
      href: config.facebook.trim(),
    });
  }

  if (config.youTube?.trim()) {
    links.push({
      label: config.youTubeLabel?.trim() || "Nirvana Yoga on YouTube",
      href: config.youTube.trim(),
    });
  }

  return links;
}

export function primaryInstagramHref(config: SiteSocialConfig): string {
  return config.nirvanaYogaInstagram.trim() || config.justArtAffaireInstagram.trim();
}
