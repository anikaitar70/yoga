"use client";

import Image from "next/image";
import type { MediaImageProps } from "@/content/types";
import { imageFrameClassName } from "@/lib/constants";
import type { SectionLayoutSettings } from "@/lib/section-layout";
import { useLayoutOverride } from "@/components/content/sections/LayoutOverrideContext";
import { previewImageStyle, usePreviewLayoutMetrics } from "@/components/content/sections/usePreviewLayoutMetrics";
import { sectionImageStyleFromLayout } from "@/lib/section-layout";
import { cn } from "@/lib/utils";

type LayoutAwareMediaImageProps = MediaImageProps & {
  sectionType?: string;
  layout?: SectionLayoutSettings | null;
};

export function LayoutAwareMediaImage({
  src,
  alt,
  aspectClass = "aspect-[4/5]",
  sizes = "(max-width: 1024px) 100vw, 50vw",
  priority,
  className,
  sectionType = "IMAGE_TEXT",
  layout,
}: LayoutAwareMediaImageProps) {
  const override = useLayoutOverride();
  const effective = override ?? layout ?? null;
  const { isLivePreview, numerics } = usePreviewLayoutMetrics(effective, sectionType);
  const tunedStyle =
    isLivePreview
      ? previewImageStyle(numerics)
      : sectionImageStyleFromLayout(effective ?? undefined, sectionType);
  const useTunedFrame = Boolean(tunedStyle);

  return (
    <div
      className={cn(
        imageFrameClassName,
        "image-vignette relative w-full min-w-0 overflow-hidden",
        !useTunedFrame && aspectClass,
        className,
      )}
      style={tunedStyle ?? undefined}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className="object-cover transition-transform duration-700 hover:scale-[1.02]"
        sizes={sizes}
        unoptimized={src.startsWith("/uploads/")}
      />
    </div>
  );
}
