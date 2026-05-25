import Image from "next/image";
import type { GalleryItem } from "@/content/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

type GalleryListProps = {
  items: GalleryItem[];
  className?: string;
};

export function GalleryList({ items, className }: GalleryListProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="Gallery coming soon"
        description="Studio photos and moments will be added here shortly."
      />
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {items.map((item) => (
        <figure
          key={item.id}
          className={cn(
            "relative overflow-hidden rounded-sm border border-border bg-card",
            item.aspectClass ?? "aspect-square",
          )}
        >
          <Image
            src={item.src}
            alt={item.alt}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </figure>
      ))}
    </div>
  );
}
