import Image from "next/image";
import type { MediaImageProps } from "@/content/types";
import { imageFrameClassName } from "@/lib/constants";
import { cn } from "@/lib/utils";

const defaultSizes = "(max-width: 1024px) 100vw, 50vw";

export function MediaImage({
  src,
  alt,
  aspectClass = "aspect-[4/5]",
  sizes = defaultSizes,
  priority,
  className,
}: MediaImageProps) {
  return (
    <div className={cn(imageFrameClassName, "image-vignette", aspectClass, className)}>
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
