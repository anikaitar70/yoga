import type { ContentBlock } from "@/content/types";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

type ContentCardProps = {
  item: ContentBlock;
  className?: string;
};

export function ContentCard({ item, className }: ContentCardProps) {
  return (
    <Card as="li" className={cn("p-8", className)}>
      <h2 className="font-display text-xl font-medium text-foreground">
        {item.title}
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-muted">{item.body}</p>
    </Card>
  );
}
