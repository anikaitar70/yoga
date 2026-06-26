import { fetchSite } from "@/content";
import { fetchHomepageSections } from "@/content/repositories/site";
import { ContactPreviewSectionView } from "@/components/home/HomepageSectionViews";
import { resolveHomepageSectionLayouts, type HomepageLayoutSettings } from "@/lib/homepage-layout";

export async function ContactPreview() {
  const [site, sections] = await Promise.all([fetchSite(), fetchHomepageSections()]);
  const sectionLayouts = resolveHomepageSectionLayouts(
    site.homepageLayout as HomepageLayoutSettings | undefined,
  );
  return (
    <ContactPreviewSectionView
      site={site.contact}
      social={site.social}
      chrome={sections.contactPreview}
      layout={sectionLayouts.contact}
    />
  );
}
