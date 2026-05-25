import type { BlogPost } from "@/content/types";
import { BlogCard } from "@/components/ui/BlogCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

type BlogListProps = {
  posts: BlogPost[];
  className?: string;
};

export function BlogList({ posts, className }: BlogListProps) {
  if (posts.length === 0) {
    return (
      <EmptyState
        title="No posts yet"
        description="Essays and reflections will appear here as they are published."
      />
    );
  }

  return (
    <div className={cn("grid gap-8 md:grid-cols-2 lg:grid-cols-3", className)}>
      {posts.map((post) => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  );
}
