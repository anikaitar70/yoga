import { prisma } from "@/lib/prisma";
import BlogManager from "@/components/admin/BlogManager";
import type { AdminBlogPost } from "@/lib/admin-types";

async function getPosts() {
  const data = await prisma.blogPost.findMany({
    orderBy: { publishedAt: "desc" },
  });
  return data.map((item) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    summary: item.summary,
    content: item.content,
    coverImageUrl: item.coverImageUrl,
    tags: item.tags,
    published: item.published,
    publishedAt: item.publishedAt.toISOString(),
  })) as AdminBlogPost[];
}

export default async function AdminBlogsPage() {
  const posts = await getPosts();

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Blog posts</h1>
        <p className="mt-2 text-sm text-slate-600">Create and edit the blog content for Nirvana Yoga.</p>
      </div>
      <BlogManager initialPosts={posts} />
    </div>
  );
}
