import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { SeoFields } from "@/lib/seo/types";

export type PageSeoRecord = SeoFields & {
  path: string;
};

export const fetchPageSeo = cache(async function fetchPageSeo(
  path: string,
): Promise<PageSeoRecord | null> {
  const normalized = path === "" ? "/" : path.startsWith("/") ? path : `/${path}`;
  try {
    const row = await prisma.pageSeo.findUnique({ where: { path: normalized } });
    if (!row) return null;
    return {
      path: row.path,
      seoTitle: row.seoTitle,
      metaDescription: row.metaDescription,
      ogImageUrl: row.ogImageUrl,
      canonicalUrlOverride: row.canonicalUrlOverride,
      focusKeywords: row.focusKeywords,
      jaTranslationStatus: row.jaTranslationStatus,
    };
  } catch {
    return null;
  }
});

export const fetchAllPageSeo = cache(async function fetchAllPageSeo(): Promise<PageSeoRecord[]> {
  try {
    const rows = await prisma.pageSeo.findMany();
    return rows.map((row) => ({
      path: row.path,
      seoTitle: row.seoTitle,
      metaDescription: row.metaDescription,
      ogImageUrl: row.ogImageUrl,
      canonicalUrlOverride: row.canonicalUrlOverride,
      focusKeywords: row.focusKeywords,
      jaTranslationStatus: row.jaTranslationStatus,
    }));
  } catch {
    return [];
  }
});
