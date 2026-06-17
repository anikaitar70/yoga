import type { GalleryCollage, GalleryItem } from "@/content/types";
import type { CollageLayout } from "@/lib/collage-layouts";
import { ClickableGalleryImage } from "@/components/content/ImageLightbox";
import { cn } from "@/lib/utils";

type CollageGridProps = {
  layout: CollageLayout;
  items: GalleryItem[];
  className?: string;
  onOpenLightbox?: (items: GalleryItem[], index: number) => void;
};

function CollageCell({
  item,
  items,
  className,
  onOpen,
}: {
  item: GalleryItem;
  items: GalleryItem[];
  className?: string;
  onOpen?: (index: number) => void;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-lg border border-border/70 bg-card shadow-sm", className)}>
      <ClickableGalleryImage
        item={item}
        items={items}
        className="relative h-full min-h-[120px] w-full"
        onOpen={onOpen}
      />
    </div>
  );
}

export function CollageGrid({ layout, items, className, onOpenLightbox }: CollageGridProps) {
  const handleOpen = (index: number) => onOpenLightbox?.(items, index);
  if (items.length === 0) {
    return null;
  }

  switch (layout) {
    case "STACKED":
      return (
        <div className={cn("grid gap-3", className)}>
          {items.slice(0, 6).map((item) => (
            <CollageCell key={item.id} item={item} items={items} className="aspect-[16/9]" onOpen={handleOpen} />
          ))}
        </div>
      );

    case "HORIZONTAL_STRIP":
      return (
        <div className={cn("flex gap-3 overflow-x-auto py-2 pb-4", className)}>
          {items.slice(0, 8).map((item) => (
            <CollageCell
              key={item.id}
              item={item}
              items={items}
              className="aspect-[4/5] w-44 shrink-0 sm:w-56"
              onOpen={handleOpen}
            />
          ))}
        </div>
      );

    case "HERO_SUPPORTING": {
      const [hero, ...rest] = items;
      return (
        <div className={cn("grid gap-3 lg:grid-cols-[2fr_1fr]", className)}>
          <CollageCell item={hero} items={items} className="aspect-[4/3] min-h-[240px] lg:min-h-[360px]" onOpen={handleOpen} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {rest.slice(0, 4).map((item) => (
              <CollageCell key={item.id} item={item} items={items} className="aspect-square" onOpen={handleOpen} />
            ))}
          </div>
        </div>
      );
    }

    case "FEATURED_SUPPORTING": {
      const [featured, ...rest] = items;
      return (
        <div className={cn("grid gap-3 md:grid-cols-2", className)}>
          <CollageCell item={featured} items={items} className="aspect-[3/4] md:row-span-2 md:aspect-auto md:min-h-[420px]" onOpen={handleOpen} />
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
            {rest.slice(0, 3).map((item) => (
              <CollageCell key={item.id} item={item} items={items} className="aspect-[4/3]" onOpen={handleOpen} />
            ))}
          </div>
        </div>
      );
    }

    case "ASYMMETRICAL_GRID":
      return (
        <div className={cn("grid auto-rows-[140px] grid-cols-2 gap-3 sm:auto-rows-[180px] md:grid-cols-4", className)}>
          {items.slice(0, 8).map((item, index) => (
            <CollageCell
              key={item.id}
              item={item}
              items={items}
              className={cn(
                index === 0 && "col-span-2 row-span-2",
                index === 3 && "col-span-2",
                index === 5 && "row-span-2",
              )}
              onOpen={handleOpen}
            />
          ))}
        </div>
      );

    case "MASONRY":
    default:
      return (
        <div className={cn("columns-2 gap-3 sm:columns-3", className)}>
          {items.slice(0, 12).map((item, index) => (
            <div key={item.id} className="mb-3 break-inside-avoid">
              <CollageCell
                item={item}
                items={items}
                className={cn(
                  "w-full",
                  index % 3 === 0 ? "aspect-[3/4]" : index % 3 === 1 ? "aspect-square" : "aspect-[4/5]",
                )}
                onOpen={handleOpen}
              />
            </div>
          ))}
        </div>
      );
  }
}

export function CollageSection({ collage, className }: { collage: GalleryCollage; className?: string }) {
  return (
    <section className={className} aria-label={collage.name}>
      <CollageGrid layout={collage.layout} items={collage.items} />
    </section>
  );
}
