import type { Testimonial } from "@/content/types";
import { TestimonialCarousel } from "@/components/testimonials/TestimonialCarousel";

type TestimonialListProps = {
  testimonials: Testimonial[];
  className?: string;
  variant?: "default" | "featured";
};

/** @deprecated Use TestimonialCarousel directly */
export function TestimonialList({ testimonials, className, variant = "default" }: TestimonialListProps) {
  return (
    <TestimonialCarousel
      testimonials={testimonials}
      className={className}
      variant={variant}
      animated={false}
    />
  );
}
