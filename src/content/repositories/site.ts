import type {
  AboutPreviewContent,
  ContentBlock,
  HeroContent,
  MediaPage,
  PageIntro,
  PhilosophyContent,
  SiteConfig,
} from "@/content/types";
import {
  SITE_NAME,
  aboutPageCopy,
  aboutPreviewCopy,
  healingModalities,
  heroCopy,
  pageIntroCopy,
  philosophyCopy,
  yogaOfferings,
  yogaSutras,
} from "@/content/nirvana-copy";
import { resolveContent } from "@/content/utils";
import {
  buildSocialLinks,
  DEFAULT_SOCIAL_CONFIG,
  parseSiteSocialConfig,
} from "@/lib/site-social";
import { parseSiteBranding } from "@/lib/site-branding";
import { jaaLogoFromParsed, jaaLogoFromUnknown, logBrandingTrace } from "@/lib/branding-diagnostics";
import { SITE_CONFIG_ID } from "@/lib/site-config-store";
import type { HeroRotatingImage } from "@/lib/hero-media";
import {
  DEFAULT_HOMEPAGE_SECTIONS,
  mergeHomepageSections,
  type HomepageSectionsContent,
} from "@/lib/homepage-sections";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isGallerySchemaReady } from "@/lib/gallery-schema";
import { fetchGalleryCollage, fetchGalleryItemsByCollection } from "./gallery";

const fallbackSiteRow = {
  name: SITE_NAME,
  tagline: "Rooted in tradition. Guided by presence.",
  navigation: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Yoga", href: "/yoga" },
    { label: "Just Art Affaire", href: "/just-art-life" },
    { label: "Healing", href: "/healing" },
    { label: "Events", href: "/events" },
    { label: "Gallery", href: "/gallery" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
  contact: {
    email: "hello@nirvanayoga.studio",
    phone: "",
    address: "Japan",
  },
} satisfies Pick<SiteConfig, "name" | "tagline" | "navigation" | "contact">;

const fallbackHero: HeroContent = {
  title: heroCopy.title,
  subtitle: `${heroCopy.subtitle} ${heroCopy.body}`,
  primaryCta: heroCopy.primaryCta,
  secondaryCta: heroCopy.secondaryCta,
  imageSrc:
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1600&q=80",
  imageAlt: heroCopy.imageAlt,
};

const fallbackAboutPreview: AboutPreviewContent = {
  heading: aboutPreviewCopy.heading,
  body: aboutPreviewCopy.body,
  linkLabel: aboutPreviewCopy.linkLabel,
  linkHref: aboutPreviewCopy.linkHref,
  imageSrc:
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=900&q=80",
  imageAlt: aboutPreviewCopy.imageAlt,
};

const fallbackPhilosophy: PhilosophyContent = {
  heading: philosophyCopy.heading,
  paragraphs: yogaSutras.map((s) => s.interpretation),
  sutras: yogaSutras,
  closing: philosophyCopy.closing,
};

const fallbackYogaOfferings: ContentBlock[] = yogaOfferings;

const fallbackHealingModalities: ContentBlock[] = healingModalities;

const fallbackAboutPage: MediaPage = {
  ...aboutPageCopy,
  imageSrc:
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1000&q=80",
};

const pageIntros: Record<string, PageIntro> = pageIntroCopy;

const siteConfigCoreSelect = {
  id: true,
  name: true,
  tagline: true,
  contactEmail: true,
  contactPhone: true,
  contactAddress: true,
  social: true,
} as const;

function parseNavigation(value: unknown): SiteConfig["navigation"] {
  if (!Array.isArray(value)) {
    return fallbackSiteRow.navigation;
  }
  const items = value
    .filter((item): item is { label: string; href: string } => {
      return (
        typeof item === "object" &&
        item !== null &&
        typeof (item as { label?: unknown }).label === "string" &&
        typeof (item as { href?: unknown }).href === "string" &&
        (item as { label: string }).label.trim().length > 0 &&
        (item as { href: string }).href.trim().length > 0
      );
    })
    .map((item) => ({ label: item.label.trim(), href: item.href.trim() }));
  return items.length > 0 ? items : fallbackSiteRow.navigation;
}

function isMissingSiteConfigColumn(error: unknown, column: string): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2022") {
    return false;
  }
  const meta = error.meta as { column?: string; column_name?: string } | undefined;
  const missing = meta?.column ?? meta?.column_name;
  return missing === column || missing === `SiteConfig.${column}`;
}

function isUnknownSelectField(error: unknown, field: string): boolean {
  return (
    error instanceof Prisma.PrismaClientValidationError &&
    error.message.includes(`Unknown field \`${field}\``)
  );
}

type SiteConfigRow = {
  id: string;
  name: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  social: unknown;
  branding?: unknown;
  navigation?: unknown;
  homepageLayout?: unknown;
  homepageSections?: unknown;
  timelineStyleDefaults?: unknown;
  timelineStyleByPage?: unknown;
};

function isOptionalSiteConfigFieldError(error: unknown, field: string): boolean {
  return isUnknownSelectField(error, field) || isMissingSiteConfigColumn(error, field);
}

async function loadSiteConfigRow(): Promise<SiteConfigRow | null> {
  let includeNavigation = true;
  let includeHomepageLayout = true;
  let includeHomepageSections = true;
  let includeTimelineStyles = true;
  let includeBranding = true;
  while (true) {
    const select: Record<string, true> = { ...siteConfigCoreSelect };
    if (includeNavigation) select.navigation = true;
    if (includeBranding) select.branding = true;
    if (includeHomepageLayout) select.homepageLayout = true;
    if (includeHomepageSections) select.homepageSections = true;
    if (includeTimelineStyles) {
      select.timelineStyleDefaults = true;
      select.timelineStyleByPage = true;
    }

    try {
      let row = await prisma.siteConfig.findUnique({
        where: { id: SITE_CONFIG_ID },
        select,
      });

      if (!row) {
        row = await prisma.siteConfig.findFirst({
          orderBy: { updatedAt: "desc" },
          select,
        });
        if (row) {
          logBrandingTrace("site_fetch_fallback", {
            legacyId: row.id,
            reason: "canonical row missing",
          });
        }
      }

      if (!row) return null;

      const loaded = row as unknown as SiteConfigRow;
      return {
        ...loaded,
        navigation: includeNavigation ? loaded.navigation : undefined,
        branding: includeBranding ? loaded.branding : undefined,
        homepageLayout: includeHomepageLayout ? loaded.homepageLayout : null,
        homepageSections: includeHomepageSections ? loaded.homepageSections : null,
        timelineStyleDefaults: includeTimelineStyles ? loaded.timelineStyleDefaults : null,
        timelineStyleByPage: includeTimelineStyles ? loaded.timelineStyleByPage : null,
      };
    } catch (error) {
      if (includeNavigation && isOptionalSiteConfigFieldError(error, "navigation")) {
        includeNavigation = false;
        continue;
      }
      if (includeBranding && isOptionalSiteConfigFieldError(error, "branding")) {
        includeBranding = false;
        continue;
      }
      if (includeHomepageSections && isOptionalSiteConfigFieldError(error, "homepageSections")) {
        includeHomepageSections = false;
        continue;
      }
      if (includeHomepageLayout && isOptionalSiteConfigFieldError(error, "homepageLayout")) {
        includeHomepageLayout = false;
        continue;
      }
      if (includeTimelineStyles && isOptionalSiteConfigFieldError(error, "timelineStyleDefaults")) {
        includeTimelineStyles = false;
        continue;
      }
      if (includeTimelineStyles && isOptionalSiteConfigFieldError(error, "timelineStyleByPage")) {
        includeTimelineStyles = false;
        continue;
      }
      throw error;
    }
  }
}

export async function fetchHomepageSections(): Promise<HomepageSectionsContent> {
  const config = await loadSiteConfigRow();
  return mergeHomepageSections(
    (config?.homepageSections as Partial<HomepageSectionsContent> | null) ?? null,
  );
}

export async function fetchSite(): Promise<SiteConfig> {
  const config = await loadSiteConfigRow();
  if (!config) {
    logBrandingTrace("site_fetch", {
      configId: null,
      reason: "no SiteConfig row",
      parsedJaaLogo: parseSiteBranding(null).justArtAffaire.logoSrc,
    });
    const socialConfig = { ...DEFAULT_SOCIAL_CONFIG };
    return resolveContent({
      ...fallbackSiteRow,
      social: buildSocialLinks(socialConfig),
      socialConfig,
      branding: parseSiteBranding(null),
    });
  }

  const socialConfig = parseSiteSocialConfig(config.social);
  const branding = parseSiteBranding(config.branding ?? null);

  logBrandingTrace("site_fetch", {
    configId: config.id,
    hasBrandingField: config.branding !== undefined,
    rawJaaLogo: jaaLogoFromUnknown(config.branding),
    parsedJaaLogo: branding.justArtAffaire.logoSrc,
  });

  return resolveContent({
    name: config.name,
    tagline: config.tagline,
    navigation: parseNavigation(config.navigation ?? null),
    social: buildSocialLinks(socialConfig),
    socialConfig,
    branding,
    contact: {
      email: config.contactEmail,
      phone: config.contactPhone,
      address: config.contactAddress,
    },
    homepageLayout: (config.homepageLayout as SiteConfig["homepageLayout"] | null) ?? undefined,
    timelineStyleDefaults:
      (config.timelineStyleDefaults as SiteConfig["timelineStyleDefaults"] | null) ?? undefined,
    timelineStyleByPage:
      (config.timelineStyleByPage as SiteConfig["timelineStyleByPage"] | null) ?? undefined,
  });
}

export async function fetchHero(): Promise<HeroContent> {
  const record = await prisma.heroSection.findFirst();
  if (!record) {
    return resolveContent(fallbackHero);
  }

  const rotatingImages = Array.isArray(record.rotatingImages)
    ? (record.rotatingImages as HeroRotatingImage[])
    : undefined;

  let collageSlug: string | undefined;
  const galleryReady = await isGallerySchemaReady();
  if (record.collageId && galleryReady) {
    const collageRecord = await prisma.galleryCollage.findUnique({
      where: { id: record.collageId },
      select: { slug: true },
    });
    collageSlug = collageRecord?.slug;
  }

  const collage = collageSlug ? await fetchGalleryCollage(collageSlug) : null;

  let featuredCollectionItems: Awaited<ReturnType<typeof fetchGalleryItemsByCollection>> | undefined;
  if (record.featuredCollectionId && galleryReady) {
    const collection = await prisma.galleryCollection.findUnique({
      where: { id: record.featuredCollectionId },
      select: { slug: true },
    });
    if (collection?.slug) {
      featuredCollectionItems = await fetchGalleryItemsByCollection(collection.slug);
    }
  }

  return resolveContent({
    title: record.title,
    subtitle: record.subtitle,
    primaryCta: {
      label: record.primaryCtaLabel,
      href: record.primaryCtaHref,
    },
    secondaryCta: {
      label: record.secondaryCtaLabel,
      href: record.secondaryCtaHref,
    },
    imageSrc: record.imageSrc,
    imageAlt: record.imageAlt,
    mediaMode: record.mediaMode,
    rotatingImages,
    collage,
    featuredCollectionItems,
  });
}

export async function fetchAboutPreview() {
  const sections = await fetchHomepageSections();
  return resolveContent(sections.aboutPreview);
}

export async function fetchPhilosophy(): Promise<PhilosophyContent> {
  const sections = await fetchHomepageSections();
  return resolveContent(sections.philosophy);
}

export async function fetchYogaOfferings(): Promise<ContentBlock[]> {
  return resolveContent([...fallbackYogaOfferings]);
}

export async function fetchHealingModalities(): Promise<ContentBlock[]> {
  return resolveContent([...fallbackHealingModalities]);
}

export async function fetchAboutPage(): Promise<MediaPage> {
  const record = await prisma.aboutPage.findFirst();
  if (!record) {
    return resolveContent({ ...fallbackAboutPage });
  }

  return resolveContent({
    eyebrow: record.eyebrow,
    title: record.title,
    subtitle: record.subtitle,
    imageSrc: record.imageSrc,
    imageAlt: record.imageAlt,
    paragraphs: record.paragraphs,
  });
}

export async function fetchPageIntro(
  key: keyof typeof pageIntros,
): Promise<PageIntro> {
  return resolveContent({ ...pageIntros[key] });
}

export { pageIntros };

