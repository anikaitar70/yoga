import type { PageType } from "@/lib/page-section-types";
import type { TimelineStyleSettings } from "@/lib/timeline-style";
import type { SiteBackgroundVariant } from "@/lib/site-background";
import type { SiteBranding } from "@/lib/site-branding";
import type { DesignSettings, DesignSettingsOverride } from "@/lib/design-settings";
import type { SiteSocialConfig } from "@/lib/site-social";
import type { HomepageSpacingSettings } from "@/lib/homepage-spacing";

export type NavItem = {
  label: string;
  href: string;
};

export type SocialLink = {
  label: string;
  href: string;
};

export type SiteContact = {
  email: string;
  phone: string;
  address: string;
};

export type SiteConfig = {
  name: string;
  tagline: string;
  navigation: NavItem[];
  /** Derived Instagram display links for public UI. */
  social: SocialLink[];
  /** CMS source of truth stored in SiteConfig.social column. */
  socialConfig: SiteSocialConfig;
  branding: SiteBranding;
  contact: SiteContact;
  homepageLayout?: HomepageSpacingSettings;
  /** Derived from homepageLayout.siteBackground for convenience. */
  siteBackground?: SiteBackgroundVariant;
  timelineStyleDefaults?: TimelineStyleSettings;
  timelineStyleByPage?: Partial<Record<PageType, TimelineStyleSettings>>;
  designSettings?: DesignSettings;
  designSettingsByPage?: Partial<Record<PageType, DesignSettingsOverride>>;
};

export type CtaLink = {
  label: string;
  href: string;
};

import type { HeroMediaMode, HeroRotatingImage } from "@/lib/hero-media";
import type { GalleryCollage, GalleryItem } from "./gallery";

export type HeroContent = {
  title: string;
  subtitle: string;
  primaryCta: CtaLink;
  secondaryCta: CtaLink;
  imageSrc: string;
  imageAlt: string;
  mediaMode?: HeroMediaMode;
  rotatingImages?: HeroRotatingImage[];
  collage?: GalleryCollage | null;
  featuredCollectionItems?: GalleryItem[];
};

export type AboutPreviewContent = {
  eyebrow?: string;
  heading: string;
  body: string;
  linkLabel: string;
  linkHref: string;
  imageSrc: string;
  imageAlt: string;
};

export type YogaSutraPassage = {
  sanskrit: string;
  transliteration: string;
  translation: string;
  source: string;
  interpretation: string;
};

export type PhilosophyContent = {
  eyebrow?: string;
  heading: string;
  paragraphs: string[];
  sutras?: YogaSutraPassage[];
  closing?: string;
};

export type ContentBlock = {
  id: string;
  title: string;
  body: string;
};

export type PageIntro = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export type MediaPage = PageIntro & {
  imageSrc: string;
  imageAlt: string;
  paragraphs: string[];
};

export type MediaImageProps = {
  src: string;
  alt: string;
  aspectClass?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
};
