import { fetchHomepageSections, fetchSite } from "@/content/repositories/site";
import { fetchHomepageTestimonialsFallback } from "@/lib/testimonial-selections";
import { TestimonialsSectionView } from "@/components/home/HomepageSectionViews";
import { resolveHomepageSectionLayouts, type HomepageLayoutSettings } from "@/lib/homepage-layout";

export async function Testimonials() {
  const [items, sections, site] = await Promise.all([
    fetchHomepageTestimonialsFallback(),
    fetchHomepageSections(),
    fetchSite(),
  ]);
  const sectionLayouts = resolveHomepageSectionLayouts(
    site.homepageLayout as HomepageLayoutSettings | undefined,
  );
  return (
    <TestimonialsSectionView
      items={items}
      chrome={sections.testimonials}
      layout={sectionLayouts.testimonials}
    />
  );
}
