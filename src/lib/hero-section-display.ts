import type { HeroSectionPayload, PageSectionRecord } from "@/lib/page-section-types";
import { getProgramTheme } from "@/lib/program-page-themes";

export type HeroCtaLink = {
  label: string;
  href: string;
};

export type HeroDisplay = {
  tagline: string;
  primaryCta: HeroCtaLink;
  secondaryCta: HeroCtaLink;
  showSecondaryCta: boolean;
};

const HERO_CTA_DEFAULTS: HeroCtaLink = {
  label: "Enquire",
  href: "/contact",
};

const HERO_SECONDARY_CTA_DEFAULTS: HeroCtaLink = {
  label: "View sessions",
  href: "/events",
};

function heroPayload(section: PageSectionRecord): HeroSectionPayload | null {
  if (!section.payload || typeof section.payload !== "object") {
    return null;
  }
  return section.payload as HeroSectionPayload;
}

/** Resolve HERO tagline + CTAs: section payload → theme defaults (identical to pre-Phase-2 hardcoding). */
export function resolveHeroDisplay(section: PageSectionRecord): HeroDisplay {
  const payload = heroPayload(section);
  const theme = getProgramTheme(section.pageType);

  return {
    tagline: payload?.tagline?.trim() || theme.tagline,
    primaryCta: {
      label: payload?.primaryCta?.label?.trim() || HERO_CTA_DEFAULTS.label,
      href: payload?.primaryCta?.href?.trim() || HERO_CTA_DEFAULTS.href,
    },
    secondaryCta: {
      label: payload?.secondaryCta?.label?.trim() || HERO_SECONDARY_CTA_DEFAULTS.label,
      href: payload?.secondaryCta?.href?.trim() || HERO_SECONDARY_CTA_DEFAULTS.href,
    },
    showSecondaryCta: payload?.showSecondaryCta !== false,
  };
}

/** Defaults used by Phase 2 backfill — keeps migrated heroes visually identical. */
export function defaultHeroPayloadForPage(pageType: PageSectionRecord["pageType"]): HeroSectionPayload {
  const theme = getProgramTheme(pageType);
  return {
    tagline: theme.tagline,
    primaryCta: { ...HERO_CTA_DEFAULTS },
    secondaryCta: { ...HERO_SECONDARY_CTA_DEFAULTS },
    showSecondaryCta: true,
  };
}
