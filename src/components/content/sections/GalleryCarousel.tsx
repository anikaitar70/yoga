"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { GalleryImageItem } from "@/lib/page-section-types";
import { cn } from "@/lib/utils";

type GalleryCarouselProps = {
  images: GalleryImageItem[];
  className?: string;
};

const AUTO_ADVANCE_MS = 6000;
const SWIPE_THRESHOLD_PX = 48;

export function GalleryCarousel({ images, className }: GalleryCarouselProps) {
  const [index, setIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const count = images.length;
  const hasMultiple = count > 1;
  const current = images[index];
  const progress = hasMultiple ? ((index + 1) / count) * 100 : 100;

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setImageLoaded(false);
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);
  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);

  useEffect(() => {
    if (!hasMultiple) return;

    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setImageLoaded(false);
      setIndex((currentIndex) => (currentIndex + 1) % count);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, [count, hasMultiple]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!containerRef.current?.contains(document.activeElement)) {
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev]);

  const handlePointerDown = (clientX: number) => {
    if (!hasMultiple) return;
    dragStartX.current = clientX;
    setIsDragging(true);
    setDragOffset(0);
  };

  const handlePointerMove = (clientX: number) => {
    if (!isDragging || dragStartX.current === null) return;
    setDragOffset(clientX - dragStartX.current);
  };

  const finishDrag = () => {
    if (!isDragging) return;
    if (dragOffset > SWIPE_THRESHOLD_PX) {
      goPrev();
    } else if (dragOffset < -SWIPE_THRESHOLD_PX) {
      goNext();
    }
    dragStartX.current = null;
    setIsDragging(false);
    setDragOffset(0);
  };

  if (count === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div
        ref={containerRef}
        className="relative shadow-[0_8px_32px_rgba(42,36,31,0.06)]"
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Image gallery"
      >
        <div
          className="relative min-h-[min(56vw,320px)] overflow-hidden rounded-2xl border border-border/60 bg-muted/20 sm:min-h-[380px] lg:min-h-[460px]"
          onTouchStart={(event) => setTouchStartX(event.changedTouches[0]?.clientX ?? null)}
          onTouchEnd={(event) => {
            if (touchStartX === null) return;
            const delta = event.changedTouches[0]?.clientX - touchStartX;
            if (delta > SWIPE_THRESHOLD_PX) goPrev();
            else if (delta < -SWIPE_THRESHOLD_PX) goNext();
            setTouchStartX(null);
          }}
          onMouseDown={(event) => {
            if ((event.target as HTMLElement).closest("button")) return;
            handlePointerDown(event.clientX);
          }}
          onMouseMove={(event) => {
            if (isDragging) handlePointerMove(event.clientX);
          }}
          onMouseUp={finishDrag}
          onMouseLeave={finishDrag}
          style={isDragging ? { cursor: "grabbing" } : { cursor: hasMultiple ? "grab" : "default" }}
        >
          {!imageLoaded ? (
            <div className="absolute inset-0 skeleton-shimmer" aria-hidden />
          ) : null}

          <AnimatePresence mode="wait">
            <motion.div
              key={current.url}
              initial={reduced ? false : { opacity: 0 }}
              animate={{
                opacity: 1,
                x: isDragging ? dragOffset : 0,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex items-center justify-center p-2 sm:p-4"
            >
              <Image
                src={current.url}
                alt={current.alt}
                fill
                className={cn(
                  "object-contain transition-opacity duration-300",
                  imageLoaded ? "opacity-100" : "opacity-0",
                )}
                sizes="(max-width: 1024px) 100vw, 960px"
                onLoad={() => setImageLoaded(true)}
                draggable={false}
                priority={index === 0}
                loading={index === 0 ? undefined : "lazy"}
              />
            </motion.div>
          </AnimatePresence>

          {hasMultiple ? (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/95 text-xl text-foreground shadow-md backdrop-blur transition hover:bg-background hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:left-4 sm:h-12 sm:w-12"
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/95 text-xl text-foreground shadow-md backdrop-blur transition hover:bg-background hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:right-4 sm:h-12 sm:w-12"
                aria-label="Next image"
              >
                ›
              </button>
            </>
          ) : null}

          {current.title ? (
            <p className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/60 to-transparent px-5 py-4 text-sm text-background">
              {current.title}
            </p>
          ) : null}

          {hasMultiple ? (
            <p
              className="pointer-events-none absolute right-4 top-4 rounded-full bg-background/90 px-3.5 py-1.5 text-sm font-medium tabular-nums text-foreground shadow-md backdrop-blur"
              aria-live="polite"
            >
              {index + 1} / {count}
            </p>
          ) : null}
        </div>

        {hasMultiple ? (
          <div className="sr-only" aria-live="polite">
            Image {index + 1} of {count}: {current.alt}
          </div>
        ) : null}
      </div>

      {hasMultiple ? (
        <>
          <div
            className="h-1 overflow-hidden rounded-full bg-border/50"
            role="progressbar"
            aria-valuenow={index + 1}
            aria-valuemin={1}
            aria-valuemax={count}
            aria-label={`Gallery progress: image ${index + 1} of ${count}`}
          >
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div
            className="flex gap-2 overflow-x-auto pb-1 scroll-smooth"
            role="tablist"
            aria-label="Gallery thumbnails"
          >
            {images.map((image, imageIndex) => {
              const nearActive = Math.abs(imageIndex - index) <= 2 || imageIndex === 0;
              return (
                <button
                  key={`${image.url}-${imageIndex}`}
                  type="button"
                  role="tab"
                  aria-selected={imageIndex === index}
                  aria-label={`Show image ${imageIndex + 1}`}
                  onClick={() => goTo(imageIndex)}
                  className={cn(
                    "relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-300 sm:h-16 sm:w-24",
                    imageIndex === index
                      ? "border-primary shadow-md ring-2 ring-primary/20"
                      : "border-border/60 opacity-70 hover:border-primary/40 hover:opacity-100",
                  )}
                >
                  {nearActive ? (
                    <Image
                      src={image.url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="96px"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full bg-border/40" aria-hidden />
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-center text-xs text-muted">
            Use arrows, swipe, or thumbnails to browse · {count} images
          </p>

        </>
      ) : null}
    </div>
  );
}
