import { cn } from "@/lib/utils";

type ContentSkeletonProps = {
  layout?: "events" | "blog" | "testimonials" | "gallery" | "carousel" | "hero" | "section";
  count?: number;
  className?: string;
};

const layoutClasses: Record<Exclude<ContentSkeletonProps["layout"], undefined>, string> = {
  events: "grid gap-6 lg:grid-cols-2",
  blog: "grid gap-8 md:grid-cols-2 lg:grid-cols-3",
  testimonials: "flex gap-6 overflow-x-auto py-2",
  gallery: "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3",
  carousel: "space-y-4",
  hero: "grid min-h-[min(70vh,640px)] lg:grid-cols-2",
  section: "space-y-6",
};

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn("skeleton-shimmer rounded-sm", className)}
      aria-hidden
    />
  );
}

function TestimonialCardSkeleton() {
  return (
    <div className="w-72 shrink-0 space-y-4 rounded-xl border border-border/50 bg-card p-0 sm:w-80">
      <SkeletonBlock className="aspect-[4/3] w-full rounded-t-xl rounded-b-none" />
      <div className="space-y-3 px-6 pb-6">
        <SkeletonBlock className="h-3 w-full" />
        <SkeletonBlock className="h-3 w-5/6" />
        <SkeletonBlock className="h-3 w-2/3" />
      </div>
    </div>
  );
}

function EventCardSkeleton() {
  return (
    <div className="space-y-0 overflow-hidden rounded-xl border border-border/50 bg-card">
      <SkeletonBlock className="aspect-[16/10] w-full rounded-none" />
      <div className="space-y-3 p-7">
        <SkeletonBlock className="h-4 w-24" />
        <SkeletonBlock className="h-6 w-3/4" />
        <SkeletonBlock className="h-3 w-full" />
        <SkeletonBlock className="h-3 w-5/6" />
        <SkeletonBlock className="mt-4 h-10 w-36 rounded-full" />
      </div>
    </div>
  );
}

function CarouselSkeleton() {
  return (
    <div className="space-y-4">
      <SkeletonBlock className="min-h-[min(56vw,320px)] w-full rounded-2xl sm:min-h-[380px]" />
      <SkeletonBlock className="h-1 w-full rounded-full" />
      <div className="flex gap-2 overflow-hidden">
        <SkeletonBlock className="h-14 w-20 shrink-0 rounded-lg sm:h-16 sm:w-24" />
        <SkeletonBlock className="h-14 w-20 shrink-0 rounded-lg sm:h-16 sm:w-24" />
        <SkeletonBlock className="h-14 w-20 shrink-0 rounded-lg sm:h-16 sm:w-24" />
        <SkeletonBlock className="h-14 w-20 shrink-0 rounded-lg sm:h-16 sm:w-24" />
      </div>
    </div>
  );
}

export function ContentSkeleton({
  layout = "events",
  count = 3,
  className,
}: ContentSkeletonProps) {
  if (layout === "carousel") {
    return (
      <div className={cn(className)} role="status" aria-label="Loading gallery">
        <CarouselSkeleton />
      </div>
    );
  }

  if (layout === "hero") {
    return (
      <div
        className={cn(layoutClasses.hero, className)}
        role="status"
        aria-label="Loading hero"
      >
        <div className="flex flex-col justify-center space-y-5 px-4 py-16 sm:px-6">
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-14 w-full max-w-lg" />
          <SkeletonBlock className="h-20 w-full max-w-md" />
        </div>
        <SkeletonBlock className="min-h-[280px] rounded-none lg:min-h-0" />
      </div>
    );
  }

  if (layout === "testimonials") {
    return (
      <div
        className={cn(layoutClasses.testimonials, className)}
        role="status"
        aria-label="Loading testimonials"
      >
        {Array.from({ length: count }, (_, index) => (
          <TestimonialCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (layout === "events") {
    return (
      <div
        className={cn(layoutClasses.events, className)}
        role="status"
        aria-label="Loading content"
      >
        {Array.from({ length: count }, (_, index) => (
          <EventCardSkeleton key={index} />
        ))}
      </div>
    );
  }

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
            layout === "gallery" && "aspect-square rounded-2xl",
            layout === "section" && "h-40 sm:h-48",
            layout === "blog" && "h-48 sm:h-56",
          )}
        />
      ))}
    </div>
  );
}
