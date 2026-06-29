import { prisma } from "@/lib/prisma";
import type { BlogPost } from "@/content/types";
import { parseBlogSections } from "@/lib/blog-sections";
import { resolveContent } from "@/content/utils";
import { getLocale } from "@/lib/i18n/server";
import { localizeBlogPost } from "@/lib/i18n/resolve";

function mapBlogPost(p: {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  sections: unknown;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  tags: string[];
  publishedAt: Date;
  updatedAt: Date;
  seoTitle?: string | null;
  metaDescription?: string | null;
  ogImageUrl?: string | null;
  canonicalUrlOverride?: string | null;
  focusKeywords?: string[];
  jaTranslationStatus?: "MACHINE" | "HUMAN_REVIEWED";
  author?: { name: string | null } | null;
}): BlogPost {
  const coverAlt = p.coverImageAlt?.trim() || (p.coverImageUrl ? p.title : "Blog feature image");
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.summary,
    content: p.content,
    sections: parseBlogSections(p.sections),
    imageSrc: p.coverImageUrl ?? "",
    imageAlt: coverAlt,
    date: p.publishedAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    tags: p.tags,
    authorName: p.author?.name ?? undefined,
    seoTitle: p.seoTitle,
    metaDescription: p.metaDescription,
    ogImageUrl: p.ogImageUrl,
    canonicalUrlOverride: p.canonicalUrlOverride,
    focusKeywords: p.focusKeywords,
    jaTranslationStatus: p.jaTranslationStatus,
  };
}

const blogAuthorSelect = {
  author: { select: { name: true } },
} as const;

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const [posts, locale] = await Promise.all([
    prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      include: blogAuthorSelect,
    }),
    getLocale(),
  ]);

  return resolveContent(posts.map(mapBlogPost).map((post) => localizeBlogPost(post, locale)));
}

export async function fetchBlogPostBySlug(
  slug: string,
): Promise<BlogPost | undefined> {
  const [post, locale] = await Promise.all([
    prisma.blogPost.findUnique({
      where: { slug },
      include: blogAuthorSelect,
    }),
    getLocale(),
  ]);

  if (!post || !post.published) {
    return undefined;
  }

  return resolveContent(localizeBlogPost(mapBlogPost(post), locale));
}

export async function fetchRelatedBlogPosts(
  slug: string,
  tags: string[],
  limit = 3,
): Promise<BlogPost[]> {
  if (tags.length === 0) return [];

  const [posts, locale] = await Promise.all([
    prisma.blogPost.findMany({
      where: {
        published: true,
        slug: { not: slug },
        tags: { hasSome: tags },
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
      include: blogAuthorSelect,
    }),
    getLocale(),
  ]);

  return resolveContent(posts.map(mapBlogPost).map((post) => localizeBlogPost(post, locale)));
}

export async function fetchAllBlogSlugs(): Promise<string[]> {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true },
    });
    return posts.map((p) => p.slug);
  } catch {
    return [];
  }
}
