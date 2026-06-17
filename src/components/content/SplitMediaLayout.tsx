"use client";

import type { MediaImageProps } from "@/content/types";
import { MediaImage } from "@/components/ui/MediaImage";
import { useLayoutOverride } from "@/components/content/sections/LayoutOverrideContext";
import { resolveImageSide, type SectionImageSide } from "@/lib/section-layout";
import { cn } from "@/lib/utils";

type SplitMediaLayoutProps = {
  image: MediaImageProps;
  children: React.ReactNode;
  align?: "center" | "start";
  /** Desktop column order — image left or right of text. */
  imageSide?: SectionImageSide;
  className?: string;
};

export function SplitMediaLayout({
  image,
  children,
  align = "center",
  imageSide: imageSideProp = "left",
  className,
}: SplitMediaLayoutProps) {
  const layoutOverride = useLayoutOverride();
  const imageSide = resolveImageSide(
    layoutOverride ?? { imageSide: imageSideProp },
    "IMAGE_TEXT",
    imageSideProp,
  );
  const imageOrder = imageSide === "right" ? "lg:order-2" : "lg:order-1";
  const textOrder = imageSide === "right" ? "lg:order-1" : "lg:order-2";

  return (
    <div
      className={cn(
        "grid gap-12 lg:grid-cols-2 lg:gap-16",
        align === "center" ? "lg:items-center" : "lg:items-start",
        className,
      )}
    >
      <div className={cn(imageOrder, "min-w-0")}>
        <MediaImage {...image} />
      </div>
      <div className={cn(textOrder, "min-w-0")}>{children}</div>
    </div>
  );
}
