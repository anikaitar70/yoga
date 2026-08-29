import { fetchAllTestimonials } from "@/content/repositories/testimonials";
import { readTestimonialsPageSettings } from "@/lib/testimonials-page-settings-store";
import TestimonialsAdminClient from "@/components/admin/TestimonialsAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const [testimonials, settings] = await Promise.all([
    fetchAllTestimonials(),
    readTestimonialsPageSettings(),
  ]);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Testimonials</h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage the public Testimonials page and the testimonial library. Reorder with arrows — order is exact on the public page.
        </p>
      </div>
      <TestimonialsAdminClient
        initialTestimonials={testimonials.map((item) => ({
          id: item.id,
          quote: item.quote,
          name: item.name,
          role: item.role,
          city: item.city ?? null,
          country: item.country ?? null,
          imageUrl: item.imageUrl ?? null,
          imageAlt: item.imageAlt ?? null,
          extractedText: item.extractedText ?? null,
          sourceType: item.sourceType ?? "text",
          displayStyle: item.displayStyle ?? "handwritten",
          ocrConfidence: item.ocrConfidence ?? null,
          featured: item.featured ?? false,
          sortOrder: item.sortOrder ?? 0,
          status: item.status,
          jaLocale: item.jaLocale ?? null,
        }))}
        initialSettings={settings}
      />
    </div>
  );
}
