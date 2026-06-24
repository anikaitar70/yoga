"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { HeroContent } from "@/content/types";
import { CollageGrid } from "@/components/content/CollageGrid";
import { cn } from "@/lib/utils";

type HeroMediaProps = {
  hero: HeroContent;
};

export function HeroMedia({ hero }: HeroMediaProps) {
  const [slideIndex, setSlideIndex] = useState(0);

  const rotatingImages =
    hero.mediaMode === "ROTATING" && hero.rotatingImages?.length
      ? hero.rotatingImages
      : null;

  useEffect(() => {
    if (!rotatingImages || rotatingImages.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      setSlideIndex((value) => (value + 1) % rotatingImages.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [rotatingImages]);

  if (hero.mediaMode === "COLLAGE" && hero.collage) {
    return (
      <div className="relative h-full min-h-[320px] p-4 lg:min-h-0 lg:p-8">
        <CollageGrid layout={hero.collage.layout} items={hero.collage.items} />
      </div>
    );
  }

  if (hero.mediaMode === "FEATURED_COLLECTION" && hero.featuredCollectionItems?.length) {
    const items = hero.featuredCollectionItems.slice(0, 4);
    return (
      <div className="relative h-full min-h-[320px] lg:min-h-0">
        <div className="grid h-full grid-cols-2 gap-1.5 p-2">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                "relative min-h-[150px] overflow-hidden rounded-lg",
                index === 0 && "col-span-2 min-h-[200px]",
              )}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                className="object-cover transition-transform duration-[1200ms] hover:scale-[1.03]"
                sizes="(max-width: 1024px) 50vw, 25vw"
                unoptimized={item.src.startsWith("/uploads/")}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const activeImage = rotatingImages?.[slideIndex] ?? {
    url: hero.imageSrc,
    alt: hero.imageAlt,
  };

  if (!activeImage.url?.trim()) {
    return (
      <div
        className="relative h-full min-h-[320px] bg-gradient-to-br from-accent-soft/40 to-border/30 lg:min-h-0"
        aria-hidden
      />
    );
  }

  return (
    <div className="relative h-full min-h-[320px] lg:min-h-0">
      <Image
        src={activeImage.url}
        alt={activeImage.alt}
        fill
        priority
        className="object-cover transition-opacity duration-1000"
        sizes="(max-width: 1024px) 100vw, 55vw"
        unoptimized={activeImage.url.startsWith("/uploads/")}
      />
      {rotatingImages && rotatingImages.length > 1 ? (
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2.5">
          {rotatingImages.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Show slide ${index + 1}`}
              onClick={() => setSlideIndex(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-500",
                index === slideIndex ? "w-6 bg-white" : "w-2 bg-white/45 hover:bg-white/70",
              )}
            />
          ))}
        </div>
      ) : null}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent lg:bg-gradient-to-l lg:from-background/30"
        aria-hidden
      />
    </div>
  );
}
