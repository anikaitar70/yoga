import type { EventCategoryValue } from "@/lib/event-categories";
import type { HomepageSpacingSettings } from "@/lib/homepage-spacing";
import type { LocaleContentStore } from "@/lib/i18n/locale-content";
import type { SectionLayoutSettings } from "@/lib/section-layout";
import type { SiteBackgroundVariant } from "@/lib/site-background";

export type EventCategory = EventCategoryValue;

export interface AdminEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt?: string | null;
  imageUrl?: string | null;
  price?: number | null;
  category: EventCategory;
  isFeatured: boolean;
  published: boolean;
}

import type { BlogSection } from "@/lib/blog-sections";

export interface AdminBlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  sections?: BlogSection[];
  coverImageUrl?: string | null;
  tags: string[];
  published: boolean;
  publishedAt: string;
}

import type { SiteSocialConfig } from "@/lib/site-social";
import type { SiteBranding } from "@/lib/site-branding";

export interface SiteSocialLink {
  label: string;
  href: string;
}

export interface AdminSiteConfig {
  id: string;
  name: string;
  tagline: string;
  navigation: { label: string; href: string }[];
  social: SiteSocialLink[];
  socialConfig: SiteSocialConfig;
  branding: SiteBranding;
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  homepageLayout?: HomepageSpacingSettings;
  siteBackground?: SiteBackgroundVariant;
  localeContent?: LocaleContentStore | null;
}

export interface AdminHero {
  id: string;
  title: string;
  subtitle: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  imageSrc: string;
  imageAlt: string;
  mediaMode?: "SINGLE" | "ROTATING" | "COLLAGE" | "FEATURED_COLLECTION";
  rotatingImages?: { url: string; alt: string }[];
  collageId?: string | null;
  featuredCollectionId?: string | null;
}

export interface AdminAboutPage {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
}

export type TestimonialStatus = "pending" | "approved" | "rejected";

export interface AdminTestimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  city?: string | null;
  country?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  extractedText?: string | null;
  sourceType?: "text" | "image" | "ocr";
  displayStyle?: "card" | "handwritten";
  ocrConfidence?: number | null;
  featured?: boolean;
  sortOrder?: number;
  status: TestimonialStatus;
}

export interface AdminGalleryItem {
  id: string;
  title?: string | null;
  src: string;
  alt: string;
  thumbnailUrl?: string | null;
  mediumUrl?: string | null;
  width?: number | null;
  height?: number | null;
  aspectClass?: string | null;
  description?: string | null;
  category?: string;
  collectionId?: string | null;
  collectionSlug?: string | null;
  sortOrder?: number;
  featuredOnHomepage?: boolean;
  isPublished?: boolean;
}

export interface AdminGalleryCollection {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  category: string;
  sortOrder: number;
}

export interface AdminGalleryCollage {
  id: string;
  name: string;
  slug: string;
  layout: string;
  category: string;
  collectionId?: string | null;
  imageIds: string[];
  isPublished: boolean;
}

export interface AdminSubscriber {
  id: string;
  email: string;
  name?: string | null;
  subscribedAt: string;
}

export interface AdminContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  preferredContactMethod?: string | null;
  createdAt: string;
}

export interface AdminPageSection {
  id: string;
  pageType: "YOGA" | "HEALING" | "JUST_ART_LIFE" | "ABOUT";
  sectionType: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  sortOrder: number;
  isPublished: boolean;
  layout: SectionLayoutSettings | null;
  payload: Record<string, unknown> | null;
}
