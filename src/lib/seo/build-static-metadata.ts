import type { Metadata } from "next";
import { fetchSite } from "@/content";
import { fetchPageSeo } from "@/content/repositories/page-seo";
import { getLocale } from "@/lib/i18n/server";
import { buildPageMetadata, mergeSeoDefaults } from "@/lib/seo/metadata";
import {
  getStaticPageDefaults,
  type StaticPageKey,
} from "@/lib/seo/page-defaults";
import { DEFAULT_LOGO_SRC } from "@/lib/site-branding";

export async function buildStaticPageMetadata(key: StaticPageKey): Promise<Metadata> {
  const [locale, site, pageSeo] = await Promise.all([
    getLocale(),
    fetchSite(),
    fetchPageSeo(getStaticPageDefaults(key, "en").path),
  ]);

  const defaults = getStaticPageDefaults(key, locale);
  const merged = mergeSeoDefaults(
    { title: defaults.title, description: defaults.description },
    pageSeo,
  );

  return buildPageMetadata(
    {
      title: merged.title,
      description: merged.description,
      path: defaults.path,
      ogImage: merged.ogImage,
      keywords: merged.keywords,
      canonicalOverride: merged.canonicalOverride,
    },
    locale,
    site.name,
    site.branding.nirvanaYoga.logoSrc || DEFAULT_LOGO_SRC.nirvanaYoga,
  );
}

export async function getPageTranslationReviewStatus(
  path: string,
  contentStatus?: "MACHINE" | "HUMAN_REVIEWED",
): Promise<"MACHINE" | "HUMAN_REVIEWED"> {
  if (contentStatus === "HUMAN_REVIEWED") return "HUMAN_REVIEWED";
  const pageSeo = await fetchPageSeo(path);
  return pageSeo?.jaTranslationStatus ?? contentStatus ?? "MACHINE";
}

export function isHumanReviewed(status: "MACHINE" | "HUMAN_REVIEWED"): boolean {
  return status === "HUMAN_REVIEWED";
}
