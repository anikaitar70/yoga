"use client";

import type { Testimonial } from "@/content/types";
import { TestimonialCard } from "@/components/testimonials/TestimonialCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { HorizontalScrollItem, HorizontalScrollRail } from "@/components/ui/HorizontalScrollRail";
import { MotionReveal } from "@/components/program/MotionReveal";
import { dedupeTestimonialsForCarousel } from "@/lib/testimonial-display";
import { cn } from "@/lib/utils";

type TestimonialCarouselProps = {
  testimonials: Testimonial[];
  className?: string;
  variant?: "default" | "featured";
  animated?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  quoteClassName?: string;
};

export function TestimonialCarousel({
  testimonials,
  className,
  variant = "default",
  animated = true,
  emptyTitle = "No testimonials yet",
  emptyDescription = "Community voices will be shared here with permission.",
  quoteClassName,
}: TestimonialCarouselProps) {
  const visible = dedupeTestimonialsForCarousel(testimonials);

  if (visible.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  const rail = (
    <HorizontalScrollRail
      variant={variant === "featured" ? "testimonialFeatured" : "testimonial"}
      itemCount={visible.length}
      className={cn(className, quoteClassName)}
      aria-label="Testimonials"
    >
      {visible.map((testimonial) => (
        <HorizontalScrollItem
          key={testimonial.id}
          variant={variant === "featured" ? "testimonialFeatured" : "testimonial"}
        >
          <TestimonialCard testimonial={testimonial} className="h-full" variant={variant} />
        </HorizontalScrollItem>
      ))}
    </HorizontalScrollRail>
  );

  if (!animated) {
    return rail;
  }

  return <MotionReveal variant="fade">{rail}</MotionReveal>;
}
