import { fetchSite } from "@/content";
import { fetchHomepageSections } from "@/content/repositories/site";
import { ContactPreviewSectionView } from "@/components/home/HomepageSectionViews";

export async function ContactPreview() {
  const [site, sections] = await Promise.all([fetchSite(), fetchHomepageSections()]);
  return (
    <ContactPreviewSectionView
      site={site.contact}
      social={site.social}
      chrome={sections.contactPreview}
    />
  );
}
