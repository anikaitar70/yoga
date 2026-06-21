/** Site-wide scroll background — change variant here or via NEXT_PUBLIC_SITE_BACKGROUND. */

export const SITE_BACKGROUND_VARIANTS = {
  aurora: {
    label: "Luminous Aurora",
    description:
      "Soft sage and terracotta glows that drift at different speeds as you scroll — calm and warm.",
  },
  mandala: {
    label: "Breath Mandala",
    description:
      "Faint concentric circles and cross-lines that rotate gently with scroll, like a meditation focal point.",
  },
  horizon: {
    label: "Warm Horizon",
    description:
      "Layered sunrise washes and a slow parallax horizon band — editorial and grounded.",
  },
  ripple: {
    label: "Quiet Ripple",
    description:
      "Subtle flowing wave lines and a dot field that shift with scroll — minimal and refined.",
  },
} as const;

export type SiteBackgroundVariant = keyof typeof SITE_BACKGROUND_VARIANTS;

const VALID_VARIANTS = Object.keys(SITE_BACKGROUND_VARIANTS) as SiteBackgroundVariant[];

function parseVariant(value: string | undefined): SiteBackgroundVariant {
  if (value && VALID_VARIANTS.includes(value as SiteBackgroundVariant)) {
    return value as SiteBackgroundVariant;
  }
  return "aurora";
}

/** Active background preset when nothing is stored in SiteConfig. */
export const DEFAULT_SITE_BACKGROUND: SiteBackgroundVariant = parseVariant(
  process.env.NEXT_PUBLIC_SITE_BACKGROUND,
);

export function parseSiteBackgroundVariant(value: unknown): SiteBackgroundVariant {
  if (typeof value === "string") {
    return parseVariant(value);
  }
  return DEFAULT_SITE_BACKGROUND;
}

export function resolveSiteBackground(
  homepageLayout?: { siteBackground?: unknown } | null,
): SiteBackgroundVariant {
  return parseSiteBackgroundVariant(homepageLayout?.siteBackground);
}
