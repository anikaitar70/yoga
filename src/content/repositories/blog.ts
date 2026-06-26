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
  tags: string[];
  publishedAt: Date;
}): BlogPost {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.summary,
    content: p.content,
    sections: parseBlogSections(p.sections),
    imageSrc: p.coverImageUrl ?? "",
    imageAlt: p.coverImageUrl ? p.title : "Blog feature image",
    date: p.publishedAt.toISOString(),
    tags: p.tags,
  };
}

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const [posts, locale] = await Promise.all([
    prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
    }),
    getLocale(),
  ]);

  return resolveContent(posts.map(mapBlogPost).map((post) => localizeBlogPost(post, locale)));
}

export async function fetchBlogPostBySlug(
  slug: string,
): Promise<BlogPost | undefined> {
  const [post, locale] = await Promise.all([
    prisma.blogPost.findUnique({ where: { slug } }),
    getLocale(),
  ]);

  if (!post || !post.published) {
    return undefined;
  }

  return resolveContent(localizeBlogPost(mapBlogPost(post), locale));
}
