import type { TranslationReviewStatus } from "@prisma/client";

export type SeoFields = {
  seoTitle?: string | null;
  metaDescription?: string | null;
  ogImageUrl?: string | null;
  canonicalUrlOverride?: string | null;
  focusKeywords?: string[];
  jaTranslationStatus?: TranslationReviewStatus;
};

export type PageMetadataInput = {
  /** English title (or primary locale title) */
  title: string;
  description: string;
  /** Path without locale prefix, e.g. `/blog/my-post` */
  path: string;
  ogImage?: string | null;
  ogImageAlt?: string;
  keywords?: string[];
  canonicalOverride?: string | null;
  noIndex?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  tags?: string[];
};

export type BreadcrumbItem = {
  label: string;
  href: string;
};
