import type { MediaImageProps } from "@/content/types";
import { MediaImage } from "@/components/ui/MediaImage";
import { cn } from "@/lib/utils";

type SplitMediaLayoutProps = {
  image: MediaImageProps;
  children: React.ReactNode;
  align?: "center" | "start";
  className?: string;
};

export function SplitMediaLayout({
  image,
  children,
  align = "center",
  className,
}: SplitMediaLayoutProps) {
  return (
    <div
      className={cn(
        "grid gap-12 lg:grid-cols-2 lg:gap-16",
        align === "center" ? "lg:items-center" : "lg:items-start",
        className,
      )}
    >
      <MediaImage {...image} />
      {children}
    </div>
  );
}
