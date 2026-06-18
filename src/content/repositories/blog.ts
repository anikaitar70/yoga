import { prisma } from "@/lib/prisma";
import type { BlogPost } from "@/content/types";
import { parseBlogSections } from "@/lib/blog-sections";
import { resolveContent } from "@/content/utils";

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
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });

  return resolveContent(posts.map(mapBlogPost));
}

export async function fetchBlogPostBySlug(
  slug: string,
): Promise<BlogPost | undefined> {
  const post = await prisma.blogPost.findUnique({
    where: { slug },
  });

  if (!post || !post.published) {
    return undefined;
  }

  return resolveContent(mapBlogPost(post));
}
