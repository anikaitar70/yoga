import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/locale";
import { DEFAULT_LOCALE } from "@/lib/i18n/locale";
import { localizedPath } from "@/lib/i18n/paths";
import { getMetadataBase } from "@/lib/site";
import { DEFAULT_LOGO_SRC } from "@/lib/site-branding";
import type { PageMetadataInput } from "@/lib/seo/types";

const OG_LOCALE_MAP: Record<Locale, string> = {
  en: "en_US",
  ja: "ja_JP",
};

export function resolveCanonicalUrl(path: string, locale: Locale, override?: string | null): string {
  const base = getMetadataBase();
  if (override?.trim()) {
    try {
      return new URL(override.trim(), base).toString();
    } catch {
      // fall through
    }
  }
  return new URL(localizedPath(path, locale), base).toString();
}

export function buildAlternates(path: string): Metadata["alternates"] {
  const base = getMetadataBase();
  const enPath = localizedPath(path, "en");
  const jaPath = localizedPath(path, "ja");
  return {
    canonical: new URL(enPath, base).toString(),
    languages: {
      en: new URL(enPath, base).toString(),
      ja: new URL(jaPath, base).toString(),
      "x-default": new URL(enPath, base).toString(),
    },
  };
}

export function buildPageMetadata(
  input: PageMetadataInput,
  locale: Locale,
  siteName: string,
  defaultOgImage?: string,
): Metadata {
  const ogImage = input.ogImage?.trim() || defaultOgImage || DEFAULT_LOGO_SRC.nirvanaYoga;
  const canonical = resolveCanonicalUrl(input.path, locale, input.canonicalOverride);
  const enPath = localizedPath(input.path, "en");
  const jaPath = localizedPath(input.path, "ja");
  const base = getMetadataBase();
  const isJa = locale === "ja";

  const metadata: Metadata = {
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    alternates: {
      canonical,
      languages: {
        en: new URL(enPath, base).toString(),
        ja: new URL(jaPath, base).toString(),
        "x-default": new URL(enPath, base).toString(),
      },
    },
    openGraph: {
      type: input.type ?? "website",
      locale: OG_LOCALE_MAP[locale],
      alternateLocale: locale === DEFAULT_LOCALE ? ["ja_JP"] : ["en_US"],
      siteName,
      title: input.title,
      description: input.description,
      url: canonical,
      images: [
        {
          url: ogImage,
          alt: input.ogImageAlt ?? input.title,
        },
      ],
      ...(input.type === "article" && input.publishedTime
        ? {
            publishedTime: input.publishedTime,
            modifiedTime: input.modifiedTime ?? input.publishedTime,
            authors: input.authors,
            tags: input.tags,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [ogImage],
    },
    robots: input.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };

  if (isJa) {
    metadata.other = {
      ...(metadata.other ?? {}),
      "content-language": "ja",
    };
  }

  return metadata;
}

export function mergeSeoDefaults(
  defaults: { title: string; description: string },
  seo?: {
    seoTitle?: string | null;
    metaDescription?: string | null;
    ogImageUrl?: string | null;
    canonicalUrlOverride?: string | null;
    focusKeywords?: string[];
  } | null,
): Pick<PageMetadataInput, "title" | "description" | "ogImage" | "canonicalOverride" | "keywords"> {
  return {
    title: seo?.seoTitle?.trim() || defaults.title,
    description: seo?.metaDescription?.trim() || defaults.description,
    ogImage: seo?.ogImageUrl?.trim() || null,
    canonicalOverride: seo?.canonicalUrlOverride?.trim() || null,
    keywords: seo?.focusKeywords?.length ? seo.focusKeywords : undefined,
  };
}
