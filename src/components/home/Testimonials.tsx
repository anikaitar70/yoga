import { fetchTestimonials } from "@/content";
import { fetchHomepageSections } from "@/content/repositories/site";
import { TestimonialsSectionView } from "@/components/home/HomepageSectionViews";

export async function Testimonials() {
  const [items, sections] = await Promise.all([
    fetchTestimonials(),
    fetchHomepageSections(),
  ]);
  return <TestimonialsSectionView items={items} chrome={sections.testimonials} />;
}
