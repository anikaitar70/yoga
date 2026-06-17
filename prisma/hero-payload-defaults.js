/** Hero payload defaults — mirrors src/lib/hero-section-display.ts + program-page-themes.ts */

const HERO_PAYLOAD_BY_PAGE = {
  YOGA: {
    tagline: "Awareness · Balance · Connection",
    primaryCta: { label: "Enquire", href: "/contact" },
    secondaryCta: { label: "View sessions", href: "/events" },
    showSecondaryCta: true,
  },
  HEALING: {
    tagline: "Restoration · Trust · Transformation",
    primaryCta: { label: "Enquire", href: "/contact" },
    secondaryCta: { label: "View sessions", href: "/events" },
    showSecondaryCta: true,
  },
  JUST_ART_LIFE: {
    tagline: "Creativity · Expression · Exploration",
    primaryCta: { label: "Enquire", href: "/contact" },
    secondaryCta: { label: "View sessions", href: "/events" },
    showSecondaryCta: true,
  },
};

module.exports = { HERO_PAYLOAD_BY_PAGE };
