import type { PageType } from "@/lib/page-section-types";

export type ProgramMotif = "geometric" | "organic" | "editorial";

export type ProgramPageTheme = {
  motif: ProgramMotif;
  label: string;
  tagline: string;
  shellClass: string;
  heroClass: string;
  heroPattern: string;
  sectionRhythm: string;
  cardClass: string;
  quoteClass: string;
  galleryVariant: "immersive" | "masonry" | "default";
  ctaVariant: "warm" | "primary" | "secondary";
};

export const PROGRAM_PAGE_THEMES: Record<PageType, ProgramPageTheme> = {
  YOGA: {
    motif: "geometric",
    label: "Yoga",
    tagline: "Awareness · Balance · Connection",
    shellClass: "program-theme-yoga",
    heroClass: "program-hero-yoga",
    heroPattern: "program-pattern-lines",
    sectionRhythm: "program-rhythm-yoga",
    cardClass: "program-card-yoga",
    quoteClass: "program-quote-yoga",
    galleryVariant: "immersive",
    ctaVariant: "warm",
  },
  HEALING: {
    motif: "organic",
    label: "Healing",
    tagline: "Restoration · Trust · Transformation",
    shellClass: "program-theme-healing",
    heroClass: "program-hero-healing",
    heroPattern: "program-pattern-glow",
    sectionRhythm: "program-rhythm-healing",
    cardClass: "program-card-healing",
    quoteClass: "program-quote-healing",
    galleryVariant: "immersive",
    ctaVariant: "primary",
  },
  JUST_ART_LIFE: {
    motif: "editorial",
    label: "Just Art Affaire",
    tagline: "Creativity · Expression · Exploration",
    shellClass: "program-theme-art",
    heroClass: "program-hero-art",
    heroPattern: "program-pattern-texture",
    sectionRhythm: "program-rhythm-art",
    cardClass: "program-card-art",
    quoteClass: "program-quote-art",
    galleryVariant: "masonry",
    ctaVariant: "warm",
  },
  ABOUT: {
    motif: "geometric",
    label: "About",
    tagline: "",
    shellClass: "",
    heroClass: "",
    heroPattern: "",
    sectionRhythm: "",
    cardClass: "",
    quoteClass: "",
    galleryVariant: "default",
    ctaVariant: "primary",
  },
};

export function getProgramTheme(pageType: PageType): ProgramPageTheme {
  return PROGRAM_PAGE_THEMES[pageType];
}

export const PAGE_INTRO_KEYS = {
  YOGA: "yoga",
  HEALING: "healing",
  JUST_ART_LIFE: "justArtLife",
  ABOUT: "about",
} as const satisfies Record<PageType, string>;
