import { fetchTestimonials } from "@/content";
import { TestimonialCard } from "@/components/testimonials/TestimonialCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { TestimonialsPageSettings } from "@/lib/testimonials-page-settings";
import { parseTestimonialsPageSettings } from "@/lib/testimonials-page-settings";

type Props = {
  settings?: TestimonialsPageSettings | null;
};

function gapClass(settings?: TestimonialsPageSettings | null) {
  const gap = settings?.cardGap ?? "normal";
  if (gap === "custom" && settings?.cardGapCustom) {
    return "";
  }
  const map: Record<string, string> = {
    compact: "gap-3 sm:gap-4",
    normal: "gap-6 sm:gap-6",
    relaxed: "gap-8 sm:gap-8",
  };
  return map[gap] ?? "gap-6";
}

function gapStyle(settings?: TestimonialsPageSettings | null): React.CSSProperties | undefined {
  if (settings?.cardGap === "custom" && settings.cardGapCustom) {
    return { gap: settings.cardGapCustom };
  }
  return undefined;
}

export async function TestimonialsGridView({ settings: override }: Props = {}) {
  const testimonials = await fetchTestimonials();

  if (testimonials.length === 0) {
    return <EmptyState title="No testimonials yet" description="Community reflections will appear here once approved." />;
  }

  const settings = override ? parseTestimonialsPageSettings(override) : null;
  const layout = settings?.layout ?? "grid";
  const gapCls = gapClass(settings);
  const style = gapStyle(settings);

  if (layout === "list") {
    return (
      <div className={`flex flex-col ${gapCls}`} style={style}>
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="mx-auto w-full max-w-3xl">
            <TestimonialCard testimonial={testimonial} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 ${gapCls} sm:grid-cols-2 lg:grid-cols-3`} style={style}>
      {testimonials.map((testimonial) => (
        <TestimonialCard key={testimonial.id} testimonial={testimonial} />
      ))}
    </div>
  );
}
