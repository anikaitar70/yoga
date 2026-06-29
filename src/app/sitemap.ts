import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getMetadataBase } from "@/lib/site";
import { localizedPath } from "@/lib/i18n/paths";
import { LOCALES } from "@/lib/i18n/locale";
import {
  PUBLIC_EVENT_CATEGORY_PATHS,
  PUBLIC_STATIC_PATHS,
} from "@/lib/seo/page-defaults";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getMetadataBase();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [];
  for (const path of PUBLIC_STATIC_PATHS) {
    for (const locale of LOCALES) {
      staticEntries.push({
        url: new URL(localizedPath(path, locale), base).toString(),
        lastModified: now,
        changeFrequency: path === "/" ? "weekly" : "monthly",
        priority: path === "/" ? 1 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((l) => [l, new URL(localizedPath(path, l), base).toString()]),
          ),
        },
      });
    }
  }

  for (const path of PUBLIC_EVENT_CATEGORY_PATHS) {
    for (const locale of LOCALES) {
      staticEntries.push({
        url: new URL(localizedPath(path, locale), base).toString(),
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
    });

    blogEntries = posts.flatMap((post) =>
      LOCALES.map((locale) => ({
        url: new URL(localizedPath(`/blog/${post.slug}`, locale), base).toString(),
        lastModified: post.updatedAt ?? post.publishedAt,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    );
  } catch {
    // DB unavailable during build
  }

  return [...staticEntries, ...blogEntries];
}
