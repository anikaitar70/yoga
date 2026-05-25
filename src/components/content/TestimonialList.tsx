import type { Testimonial } from "@/content/types";
import { TestimonialCard } from "@/components/ui/TestimonialCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

type TestimonialListProps = {
  testimonials: Testimonial[];
  className?: string;
};

export function TestimonialList({ testimonials, className }: TestimonialListProps) {
  if (testimonials.length === 0) {
    return (
      <EmptyState
        title="No testimonials yet"
        description="Community voices will be shared here with permission."
      />
    );
  }

  return (
    <ul className={cn("grid gap-8 md:grid-cols-3", className)}>
      {testimonials.map((testimonial) => (
        <TestimonialCard key={testimonial.id} testimonial={testimonial} />
      ))}
    </ul>
  );
}
