import { cn } from "@/lib/utils";

type ContentSkeletonProps = {
  layout?: "events" | "blog" | "testimonials" | "gallery";
  count?: number;
  className?: string;
};

const layoutClasses: Record<NonNullable<ContentSkeletonProps["layout"]>, string> = {
  events: "grid gap-6 lg:grid-cols-2",
  blog: "grid gap-8 md:grid-cols-2 lg:grid-cols-3",
  testimonials: "grid gap-8 md:grid-cols-3",
  gallery: "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3",
};

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-sm bg-border/60", className)}
      aria-hidden
    />
  );
}

export function ContentSkeleton({
  layout = "events",
  count = 3,
  className,
}: ContentSkeletonProps) {
  const items = Array.from({ length: count }, (_, index) => index);

  return (
    <div
      className={cn(layoutClasses[layout], className)}
      role="status"
      aria-label="Loading content"
    >
      {items.map((index) => (
        <SkeletonBlock
          key={index}
          className={cn(
            layout === "gallery" && "aspect-square",
            layout !== "gallery" && "h-48 sm:h-56",
          )}
        />
      ))}
    </div>
  );
}
