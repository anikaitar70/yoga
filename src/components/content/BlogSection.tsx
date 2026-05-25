import { fetchBlogPosts } from "@/content";
import { BlogList } from "@/components/content/BlogList";

export async function BlogSection() {
  const posts = await fetchBlogPosts();
  return <BlogList posts={posts} />;
}
