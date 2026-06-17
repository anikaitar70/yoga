"use client";

import { useMemo, useState } from "react";
import type { GalleryCollection, GalleryItem } from "@/content/types";
import { GALLERY_CATEGORY_LABELS } from "@/lib/gallery-categories";
import { GalleryList } from "@/components/content/GalleryList";
import { CollageGrid } from "@/components/content/CollageGrid";
import { ImageLightbox } from "@/components/content/ImageLightbox";
import type { CollageLayout } from "@/lib/collage-layouts";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { cn } from "@/lib/utils";

type GalleryCollectionsViewProps = {
  collections: GalleryCollection[];
  collagesByCollection?: Record<string, { layout: CollageLayout; items: GalleryItem[] }>;
};

type GalleryFilterKey = "all" | GalleryCollection["category"];

const FILTER_CATEGORIES: { key: GalleryFilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "ART", label: "Art" },
  { key: "YOGA_NIDRA", label: "Yoga Nidra" },
  { key: "EVENTS", label: "Workshops" },
  { key: "JAPAN_EVENTS", label: "Japan" },
  { key: "HEALING", label: "Healing" },
  { key: "RETREATS", label: "Retreats" },
];

export function GalleryCollectionsView({ collections, collagesByCollection }: GalleryCollectionsViewProps) {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [lightbox, setLightbox] = useState<{ items: GalleryItem[]; index: number } | null>(null);

  const filteredCollections = useMemo(() => {
    if (activeFilter === "all") return collections;
    return collections.filter((c) => c.category === activeFilter);
  }, [collections, activeFilter]);

  if (collections.every((collection) => collection.items.length === 0)) {
    return null;
  }

  return (
    <div className="space-y-12">
      <nav aria-label="Gallery categories" className="flex flex-wrap justify-center gap-2">
        {FILTER_CATEGORIES.map((filter) => {
          const hasItems =
            filter.key === "all" ||
            collections.some((c) => c.category === filter.key && c.items.length > 0);
          if (!hasItems && filter.key !== "all") return null;

          return (
            <button
              key={filter.key}
              type="button"
              onClick={() => setActiveFilter(filter.key)}
              className={cn(
                "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all duration-300",
                activeFilter === filter.key
                  ? "bg-primary text-white shadow-sm"
                  : "border border-border/70 bg-card text-muted hover:border-primary/30 hover:text-foreground",
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </nav>

      <div className="space-y-20">
        {filteredCollections.map((collection) => {
          if (collection.items.length === 0) {
            return null;
          }

          const collage = collagesByCollection?.[collection.slug];
          const collageIds = new Set(collage?.items.map((item) => item.id) ?? []);
          const masonryItems = collage
            ? collection.items.filter((item) => !collageIds.has(item.id))
            : collection.items;

          return (
            <ScrollReveal key={collection.id} animation="rise" as="section" id={collection.slug} className="scroll-mt-28">
              <header className="mb-8">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-primary-muted">
                  {GALLERY_CATEGORY_LABELS[collection.category]}
                </p>
                <h2 className="mt-3 font-display text-3xl font-medium tracking-[var(--tracking-display)] text-foreground sm:text-4xl">
                  {collection.title}
                </h2>
                {collection.description ? (
                  <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
                    {collection.description}
                  </p>
                ) : null}
              </header>

              {collage ? (
                <CollageGrid
                  layout={collage.layout}
                  items={collage.items}
                  className="mb-10"
                  onOpenLightbox={(items, index) => setLightbox({ items, index })}
                />
              ) : null}

              {masonryItems.length > 0 ? (
                <GalleryList
                  items={masonryItems}
                  variant="masonry"
                  onOpenLightbox={(items, index) => setLightbox({ items, index })}
                />
              ) : null}
            </ScrollReveal>
          );
        })}
      </div>

      {lightbox ? (
        <ImageLightbox
          items={lightbox.items}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      ) : null}
    </div>
  );
}
