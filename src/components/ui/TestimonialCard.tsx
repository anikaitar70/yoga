import type { Testimonial } from "@/content/types";
import { Card } from "@/components/ui/Card";

type TestimonialCardProps = {
  testimonial: Testimonial;
};

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <Card as="li" className="flex flex-col p-8 text-left">
      <blockquote className="flex-1 font-display text-lg leading-snug text-foreground">
        “{testimonial.quote}”
      </blockquote>
      <figcaption className="mt-6">
        <p className="text-sm font-medium text-foreground">{testimonial.name}</p>
        <p className="mt-1 text-xs text-muted">{testimonial.role}</p>
      </figcaption>
    </Card>
  );
}
