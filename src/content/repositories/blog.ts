import { prisma } from "@/lib/prisma";
import type { BlogPost } from "@/content/types";
import { resolveContent } from "@/content/utils";

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });

  return resolveContent(
    posts.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.summary,
      content: p.content,
      imageSrc: p.coverImageUrl ?? "",
      imageAlt: p.coverImageUrl ? p.title : "Blog feature image",
      date: p.publishedAt.toISOString(),
      tags: p.tags,
    }))
  );
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

  return resolveContent({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.summary,
    content: post.content,
    imageSrc: post.coverImageUrl ?? "",
    imageAlt: post.coverImageUrl ? post.title : "Blog feature image",
    date: post.publishedAt.toISOString(),
    tags: post.tags,
  });
}
