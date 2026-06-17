import type { AboutPreviewContent, PhilosophyContent, YogaSutraPassage } from "@/content/types";
import {
  aboutPreviewCopy,
  artPathwayCopy,
  healingPathwayCopy,
  philosophyCopy,
  upcomingPrograms,
  weeklySessions,
  yogaPathwayCopy,
  yogaSutras,
} from "@/content/nirvana-copy";

export type HomepageCtaLink = {
  label: string;
  href: string;
};

/** Section chrome shared by events, gallery, testimonials, contact, etc. */
export type HomepageSectionChrome = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  primaryCta?: HomepageCtaLink;
  secondaryCta?: HomepageCtaLink;
};

export type HomepageFeaturedEventsChrome = {
  eyebrow?: string;
  titleFeatured: string;
  titleUpcoming: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaLabelMobile?: string;
  ctaHref?: string;
};

export type HomepageGalleryChrome = HomepageSectionChrome & {
  emptyMessage?: string;
};

export type ProgramPathwayContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  ctaLabel: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  imageSide?: "left" | "right";
  variant?: "default" | "warm" | "muted";
};

export type WeeklySessionItem = {
  day: string;
  title: string;
  time: string;
  location: string;
  language: string;
};

export type UpcomingProgramItem = {
  type: string;
  title: string;
  location: string;
  dates: string;
  href: string;
  detail?: string;
};

export type HomepageAboutPreview = AboutPreviewContent & {
  eyebrow?: string;
  highlights: string[];
  imageSide?: "left" | "right";
};

export type HomepagePhilosophy = PhilosophyContent & {
  eyebrow?: string;
};

export type HomepageSectionsContent = {
  aboutPreview: HomepageAboutPreview;
  philosophy: HomepagePhilosophy;
  newsletter: { title: string; subtitle: string };
  pathways: ProgramPathwayContent[];
  weeklySessions: WeeklySessionItem[];
  upcomingPrograms: UpcomingProgramItem[];
  featuredEvents: HomepageFeaturedEventsChrome;
  retreats: HomepageSectionChrome;
  gallery: HomepageGalleryChrome;
  testimonials: HomepageSectionChrome;
  contactPreview: HomepageSectionChrome;
  schedule: HomepageSectionChrome & {
    weeklyListTitle?: string;
    programLinkLabel?: string;
  };
};

export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSectionsContent = {
  aboutPreview: {
    eyebrow: "About Shalini",
    heading: aboutPreviewCopy.heading,
    body: aboutPreviewCopy.body,
    linkLabel: aboutPreviewCopy.linkLabel,
    linkHref: aboutPreviewCopy.linkHref,
    imageSrc:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=900&q=80",
    imageAlt: aboutPreviewCopy.imageAlt,
    highlights: [...aboutPreviewCopy.highlights],
    imageSide: "left",
  },
  philosophy: {
    eyebrow: "Yogic wisdom",
    heading: philosophyCopy.heading,
    paragraphs: yogaSutras.map((s) => s.interpretation),
    sutras: yogaSutras as YogaSutraPassage[],
    closing: philosophyCopy.closing,
  },
  newsletter: {
    title: "Notes from the studio",
    subtitle: "Monthly letters—classes, workshops, and quiet invitations.",
  },
  pathways: [
    {
      ...yogaPathwayCopy,
      imageSide: "left",
      variant: "default",
      imageSrc: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=900&q=80",
      imageAlt: "Yoga practice — asana and mindful movement",
    },
    {
      ...healingPathwayCopy,
      imageSide: "right",
      variant: "warm",
      imageSrc: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=900&q=80",
      imageAlt: "Healing and holistic well-being",
    },
    {
      ...artPathwayCopy,
      imageSide: "left",
      variant: "muted",
      imageSrc: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=900&q=80",
      imageAlt: "Art and creative expression",
    },
  ],
  weeklySessions: weeklySessions.map((item) => ({ ...item })),
  upcomingPrograms: upcomingPrograms.map((item) => ({ ...item })),
  featuredEvents: {
    eyebrow: "Gatherings",
    titleFeatured: "Featured events",
    titleUpcoming: "Upcoming events",
    subtitle:
      "Workshops, teacher training, philosophy courses, and studio immersions — curated from our calendar.",
    ctaLabel: "View all events →",
    ctaLabelMobile: "View all events",
    ctaHref: "/events",
  },
  retreats: {
    eyebrow: "Journeys",
    title: "Retreats & tours",
    subtitle: "Aspirational immersions—Japan, nature, and the art of slowing down.",
    primaryCta: { label: "View all retreats", href: "/events/retreats-and-tours" },
  },
  gallery: {
    eyebrow: "Gallery",
    title: "Moments from the studio",
    subtitle: "Art, practice, retreats, and the quiet beauty in between.",
    primaryCta: { label: "View full gallery →", href: "/gallery" },
    emptyMessage:
      'No featured images yet. Mark images as "featured on homepage" in Gallery Manager.',
  },
  testimonials: {
    eyebrow: "Community",
    title: "Words from the studio",
    subtitle: "Honest reflections—shared with permission.",
  },
  contactPreview: {
    eyebrow: "Connect",
    title: "Begin your journey",
    subtitle:
      "Questions about weekly sessions, Yoga Nidra teacher training, workshops in Japan, or the India retreat — we welcome your message.",
    primaryCta: { label: "Send a message", href: "/contact" },
    secondaryCta: { label: "View sessions & workshops", href: "/events" },
  },
  schedule: {
    eyebrow: "Gatherings",
    title: "Sessions & workshops",
    subtitle:
      "Weekly classes, teacher training, philosophy courses, and upcoming immersions.",
    primaryCta: { label: "Enquire about sessions", href: "/contact" },
    weeklyListTitle: "Weekly sessions",
    programLinkLabel: "Learn more →",
  },
};

function mergeChrome<T extends HomepageSectionChrome>(
  defaults: T,
  stored: Partial<T> | undefined,
): T {
  if (!stored) return defaults;
  return {
    ...defaults,
    ...stored,
    primaryCta: stored.primaryCta
      ? { ...defaults.primaryCta, ...stored.primaryCta }
      : defaults.primaryCta,
    secondaryCta: stored.secondaryCta
      ? { ...defaults.secondaryCta, ...stored.secondaryCta }
      : defaults.secondaryCta,
  };
}

export function mergeHomepageSections(
  stored: Partial<HomepageSectionsContent> | null | undefined,
): HomepageSectionsContent {
  if (!stored) return DEFAULT_HOMEPAGE_SECTIONS;

  return {
    aboutPreview: {
      ...DEFAULT_HOMEPAGE_SECTIONS.aboutPreview,
      ...(stored.aboutPreview ?? {}),
      highlights:
        stored.aboutPreview?.highlights?.length
          ? stored.aboutPreview.highlights
          : DEFAULT_HOMEPAGE_SECTIONS.aboutPreview.highlights,
      imageSide: stored.aboutPreview?.imageSide ?? DEFAULT_HOMEPAGE_SECTIONS.aboutPreview.imageSide,
    },
    philosophy: {
      ...DEFAULT_HOMEPAGE_SECTIONS.philosophy,
      ...(stored.philosophy ?? {}),
      sutras:
        stored.philosophy?.sutras?.length
          ? stored.philosophy.sutras
          : DEFAULT_HOMEPAGE_SECTIONS.philosophy.sutras,
      paragraphs:
        stored.philosophy?.paragraphs?.length
          ? stored.philosophy.paragraphs
          : DEFAULT_HOMEPAGE_SECTIONS.philosophy.paragraphs,
    },
    newsletter: {
      ...DEFAULT_HOMEPAGE_SECTIONS.newsletter,
      ...(stored.newsletter ?? {}),
    },
    pathways:
      stored.pathways?.length
        ? stored.pathways.map((pathway, index) => ({
            ...DEFAULT_HOMEPAGE_SECTIONS.pathways[index],
            ...pathway,
            highlights: pathway.highlights?.length
              ? pathway.highlights
              : DEFAULT_HOMEPAGE_SECTIONS.pathways[index]?.highlights ?? [],
          }))
        : DEFAULT_HOMEPAGE_SECTIONS.pathways,
    weeklySessions:
      stored.weeklySessions?.length
        ? stored.weeklySessions
        : DEFAULT_HOMEPAGE_SECTIONS.weeklySessions,
    upcomingPrograms:
      stored.upcomingPrograms?.length
        ? stored.upcomingPrograms
        : DEFAULT_HOMEPAGE_SECTIONS.upcomingPrograms,
    featuredEvents: {
      ...DEFAULT_HOMEPAGE_SECTIONS.featuredEvents,
      ...(stored.featuredEvents ?? {}),
    },
    retreats: mergeChrome(DEFAULT_HOMEPAGE_SECTIONS.retreats, stored.retreats),
    gallery: {
      ...mergeChrome(DEFAULT_HOMEPAGE_SECTIONS.gallery, stored.gallery),
      emptyMessage:
        stored.gallery?.emptyMessage ?? DEFAULT_HOMEPAGE_SECTIONS.gallery.emptyMessage,
    },
    testimonials: mergeChrome(
      DEFAULT_HOMEPAGE_SECTIONS.testimonials,
      stored.testimonials,
    ),
    contactPreview: mergeChrome(
      DEFAULT_HOMEPAGE_SECTIONS.contactPreview,
      stored.contactPreview,
    ),
    schedule: {
      ...mergeChrome(DEFAULT_HOMEPAGE_SECTIONS.schedule, stored.schedule),
      weeklyListTitle:
        stored.schedule?.weeklyListTitle ?? DEFAULT_HOMEPAGE_SECTIONS.schedule.weeklyListTitle,
      programLinkLabel:
        stored.schedule?.programLinkLabel ?? DEFAULT_HOMEPAGE_SECTIONS.schedule.programLinkLabel,
    },
  };
}
