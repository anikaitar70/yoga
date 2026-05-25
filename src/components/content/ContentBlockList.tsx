import type { ContentBlock } from "@/content/types";
import { ContentCard } from "@/components/ui/ContentCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

type ContentBlockListProps = {
  items: ContentBlock[];
  emptyTitle: string;
  emptyDescription?: string;
  className?: string;
};

export function ContentBlockList({
  items,
  emptyTitle,
  emptyDescription,
  className,
}: ContentBlockListProps) {
  if (items.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <ul className={cn("grid gap-8 md:grid-cols-3", className)}>
      {items.map((item) => (
        <ContentCard key={item.id} item={item} />
      ))}
    </ul>
  );
}
