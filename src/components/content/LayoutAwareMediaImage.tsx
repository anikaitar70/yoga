"use client";

import Image from "next/image";
import type { MediaImageProps } from "@/content/types";
import { imageFrameClassName } from "@/lib/constants";
import type { SectionLayoutSettings } from "@/lib/section-layout";
import { useLayoutOverride } from "@/components/content/sections/LayoutOverrideContext";
import { previewImageStyle, usePreviewLayoutMetrics } from "@/components/content/sections/usePreviewLayoutMetrics";
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
  const useTunedFrame = isLivePreview;

  return (
    <div
      className={cn(
        imageFrameClassName,
        "image-vignette relative w-full overflow-hidden",
        !useTunedFrame && aspectClass,
        className,
      )}
      style={useTunedFrame ? previewImageStyle(numerics) : undefined}
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
