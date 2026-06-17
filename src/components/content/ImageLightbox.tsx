"use client";



import Image from "next/image";

import { useCallback, useEffect, useState } from "react";

import type { GalleryItem } from "@/content/types";

import { galleryFullSrc, galleryMediumSrc } from "@/lib/gallery-image-urls";

import { cn } from "@/lib/utils";



type ImageLightboxProps = {

  items: GalleryItem[];

  initialIndex: number;

  onClose: () => void;

};



export function ImageLightbox({ items, initialIndex, onClose }: ImageLightboxProps) {

  const [index, setIndex] = useState(initialIndex);

  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const [loaded, setLoaded] = useState(false);

  const [showFull, setShowFull] = useState(false);



  const current = items[index];

  const hasPrev = index > 0;

  const hasNext = index < items.length - 1;



  const goPrev = useCallback(() => {

    setLoaded(false);

    setShowFull(false);

    setIndex((value) => Math.max(0, value - 1));

  }, []);



  const goNext = useCallback(() => {

    setLoaded(false);

    setShowFull(false);

    setIndex((value) => Math.min(items.length - 1, value + 1));

  }, [items.length]);



  useEffect(() => {

    setLoaded(false);

    setShowFull(false);

  }, [index, current?.src]);



  useEffect(() => {

    function onKeyDown(event: KeyboardEvent) {

      if (event.key === "Escape") {

        onClose();

      } else if (event.key === "ArrowLeft" && hasPrev) {

        goPrev();

      } else if (event.key === "ArrowRight" && hasNext) {

        goNext();

      }

    }



    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", onKeyDown);

    return () => {

      document.body.style.overflow = "";

      window.removeEventListener("keydown", onKeyDown);

    };

  }, [goNext, goPrev, hasNext, hasPrev, onClose]);



  if (!current) {

    return null;

  }



  const previewSrc = galleryMediumSrc(current);

  const fullSrc = galleryFullSrc(current);

  const displaySrc = showFull && fullSrc !== previewSrc ? fullSrc : previewSrc;



  return (

    <div

      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"

      role="dialog"

      aria-modal="true"

      aria-label="Image viewer"

      onClick={onClose}

    >

      <button

        type="button"

        onClick={onClose}

        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 px-3 py-2 text-sm font-medium text-white backdrop-blur hover:bg-white/20"

        aria-label="Close"

      >

        Close

      </button>



      {hasPrev ? (

        <button

          type="button"

          onClick={(event) => {

            event.stopPropagation();

            goPrev();

          }}

          className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 px-3 py-4 text-white backdrop-blur hover:bg-white/20 sm:left-4"

          aria-label="Previous image"

        >

          ‹

        </button>

      ) : null}



      {hasNext ? (

        <button

          type="button"

          onClick={(event) => {

            event.stopPropagation();

            goNext();

          }}

          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 px-3 py-4 text-white backdrop-blur hover:bg-white/20 sm:right-4"

          aria-label="Next image"

        >

          ›

        </button>

      ) : null}



      <figure

        className="relative flex max-h-[90vh] max-w-5xl flex-col items-center"

        onClick={(event) => event.stopPropagation()}

        onTouchStart={(event) => setTouchStartX(event.changedTouches[0]?.clientX ?? null)}

        onTouchEnd={(event) => {

          if (touchStartX === null) return;

          const delta = event.changedTouches[0]?.clientX - touchStartX;

          if (delta > 60 && hasPrev) goPrev();

          if (delta < -60 && hasNext) goNext();

          setTouchStartX(null);

        }}

      >

        <div className="relative flex min-h-[200px] max-h-[75vh] w-full items-center justify-center overflow-hidden rounded-sm bg-black/20">

          {!loaded ? (

            <div className="absolute inset-0 skeleton-shimmer opacity-40" aria-hidden />

          ) : null}

          <Image

            key={displaySrc}

            src={displaySrc}

            alt={current.alt}

            width={1600}

            height={1200}

            className={cn(

              "mx-auto max-h-[75vh] w-auto object-contain transition-opacity duration-300",

              loaded ? "opacity-100" : "opacity-0",

            )}

            sizes="100vw"

            priority

            onLoad={() => {

              setLoaded(true);

              if (!showFull && fullSrc !== previewSrc) {

                const preload = new window.Image();

                preload.src = fullSrc;

                preload.onload = () => setShowFull(true);

              }

            }}

          />

        </div>

        {(current.title || current.description) && (

          <figcaption className="mt-4 max-w-2xl text-center text-sm text-white/90">

            {current.title ? <p className="font-medium">{current.title}</p> : null}

            {current.description ? <p className="mt-1 text-white/75">{current.description}</p> : null}

          </figcaption>

        )}

        {items.length > 1 ? (

          <p className="mt-2 text-xs text-white/60">

            {index + 1} / {items.length}

          </p>

        ) : null}

      </figure>

    </div>

  );

}



type ClickableGalleryImageProps = {

  item: GalleryItem;

  items: GalleryItem[];

  className?: string;

  imageClassName?: string;

  sizes?: string;

  priority?: boolean;

  onOpen?: (index: number) => void;

};



export function ClickableGalleryImage({

  item,

  items,

  className,

  imageClassName,

  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px",

  priority = false,

  onOpen,

}: ClickableGalleryImageProps) {

  const [loaded, setLoaded] = useState(false);



  const open = () => {

    const index = items.findIndex((entry) => entry.id === item.id);

    if (index >= 0) {

      onOpen?.(index);

    }

  };



  const thumbSrc = item.thumbnailSrc ?? item.mediumSrc ?? item.src;



  return (

    <button

      type="button"

      onClick={open}

      className={cn("group relative block h-full w-full cursor-zoom-in text-left", className)}

      aria-label={`View ${item.alt}`}

    >

      {!loaded ? <div className="absolute inset-0 skeleton-shimmer" aria-hidden /> : null}

      <Image

        src={thumbSrc}

        alt={item.alt}

        fill

        className={cn(

          "object-cover transition duration-300 group-hover:scale-[1.02]",

          !loaded && "opacity-0",

          imageClassName,

        )}

        sizes={sizes}

        priority={priority}

        loading={priority ? undefined : "lazy"}

        onLoad={() => setLoaded(true)}

      />

    </button>

  );

}


