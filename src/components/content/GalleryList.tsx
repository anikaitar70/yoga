"use client";



import { useMemo, useState } from "react";

import type { GalleryItem } from "@/content/types";

import { EmptyState } from "@/components/ui/EmptyState";

import { HorizontalScrollItem, HorizontalScrollRail } from "@/components/ui/HorizontalScrollRail";

import { ClickableGalleryImage } from "@/components/content/ImageLightbox";

import { LazyInView } from "@/components/ui/LazyInView";

import { GALLERY_BATCH_SIZE, GALLERY_INITIAL_BATCH } from "@/lib/gallery-constants";

import { Button } from "@/components/ui/Button";

import { cn } from "@/lib/utils";



type GalleryListProps = {

  items: GalleryItem[];

  className?: string;

  variant?: "default" | "immersive" | "masonry";

  /** Enable chunked loading for masonry (default: true on masonry). */

  chunked?: boolean;

  initialBatch?: number;

  onOpenLightbox?: (items: GalleryItem[], index: number) => void;

};



export function GalleryList({

  items,

  className,

  variant = "default",

  chunked,

  initialBatch = GALLERY_INITIAL_BATCH,

  onOpenLightbox,

}: GalleryListProps) {

  const useChunking = chunked ?? variant === "masonry";

  const [visibleCount, setVisibleCount] = useState(

    useChunking ? Math.min(initialBatch, items.length) : items.length,

  );



  const visibleItems = useMemo(

    () => (useChunking ? items.slice(0, visibleCount) : items),

    [items, useChunking, visibleCount],

  );



  const hasMore = useChunking && visibleCount < items.length;



  const handleOpen = (index: number) => {

    onOpenLightbox?.(items, index);

  };



  if (items.length === 0) {

    return (

      <EmptyState

        title="Gallery coming soon"

        description="Studio photos and moments will be added here shortly."

      />

    );

  }



  if (variant === "masonry") {

    return (

      <div className={className}>

        <div className="columns-2 gap-4 sm:columns-3">

          {visibleItems.map((item, index) => (

            <figure key={item.id} className="mb-4 break-inside-avoid">

              <div className="overflow-hidden rounded-2xl border border-border/60 shadow-[0_8px_32px_rgba(42,36,31,0.06)] transition-shadow duration-500 hover:shadow-[0_16px_48px_rgba(42,36,31,0.1)]">

                <LazyInView

                  className={cn(

                    "relative w-full",

                    index % 3 === 0 ? "aspect-[3/4]" : index % 3 === 1 ? "aspect-square" : "aspect-[4/5]",

                  )}

                >

                  <ClickableGalleryImage

                    item={item}

                    items={items}

                    className="relative h-full w-full"

                    priority={index < 4}

                    onOpen={handleOpen}

                  />

                </LazyInView>

              </div>

            </figure>

          ))}

        </div>

        {hasMore ? (

          <div className="mt-10 text-center">

            <Button

              type="button"

              variant="secondary"

              onClick={() =>

                setVisibleCount((count) => Math.min(count + GALLERY_BATCH_SIZE, items.length))

              }

            >

              Show more photos ({items.length - visibleCount} remaining)

            </Button>

          </div>

        ) : null}

      </div>

    );

  }



  const isImmersive = variant === "immersive";



  return (

    <HorizontalScrollRail

      variant="gallery"

      itemCount={items.length}

      as="div"

      className={className}

      aria-label="Photo gallery"

    >

      {items.map((item, index) => (

        <HorizontalScrollItem key={item.id} variant="gallery" as="figure">

          <div

            className={cn(

              "group transition-shadow duration-500",

              isImmersive

                ? "h-[var(--gallery-h,280px)] min-h-[200px] [aspect-ratio:auto]"

                : cn(

                    "h-[var(--gallery-h,auto)] min-h-[120px]",

                    !item.aspectClass || item.aspectClass === "aspect-square"

                      ? "aspect-square [aspect-ratio:auto]"

                      : item.aspectClass,

                  ),

            )}

          >

            <div className="relative h-full w-full overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[0_8px_32px_rgba(42,36,31,0.06)] transition-shadow duration-500 group-hover:shadow-[0_16px_48px_rgba(42,36,31,0.1)]">

              <ClickableGalleryImage

                item={item}

                items={items}

                className="relative h-full w-full transition-transform duration-700 group-hover:scale-[1.04]"

                priority={index < 3}

                onOpen={handleOpen}

              />

            </div>

          </div>

        </HorizontalScrollItem>

      ))}

    </HorizontalScrollRail>

  );

}


