import Image from "next/image";
import type { MediaImageProps } from "@/content/types";
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
    <div
      className={cn(
        "relative overflow-hidden rounded-sm border border-border",
        aspectClass,
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className="object-cover"
        sizes={sizes}
      />
    </div>
  );
}
