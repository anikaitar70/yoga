import Image from "next/image";
import { cn } from "@/lib/utils";

type TestimonialImageProps = {
  src: string;
  alt: string;
  className?: string;
  contain?: boolean;
  priority?: boolean;
};

export function TestimonialImage({
  src,
  alt,
  className,
  contain = false,
  priority = false,
}: TestimonialImageProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/50 bg-card",
        contain ? "aspect-[4/5]" : "aspect-[4/5] sm:aspect-[3/4]",
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className={cn(contain ? "object-contain p-2" : "object-cover")}
        sizes="(max-width: 768px) 88vw, 360px"
        unoptimized={src.startsWith("/uploads/")}
        priority={priority}
      />
    </div>
  );
}
