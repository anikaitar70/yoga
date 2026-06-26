import { fetchHomepageSections, fetchSite } from "@/content/repositories/site";
import { NewsletterSectionView } from "@/components/home/HomepageSectionViews";
import { resolveHomepageSectionLayouts, type HomepageLayoutSettings } from "@/lib/homepage-layout";

export async function NewsletterSection() {
  const [sections, site] = await Promise.all([fetchHomepageSections(), fetchSite()]);
  const sectionLayouts = resolveHomepageSectionLayouts(
    site.homepageLayout as HomepageLayoutSettings | undefined,
  );
  return (
    <NewsletterSectionView
      title={sections.newsletter.title}
      subtitle={sections.newsletter.subtitle}
      layout={sectionLayouts.newsletter}
    />
  );
}
