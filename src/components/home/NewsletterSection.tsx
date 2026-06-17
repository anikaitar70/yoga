import { fetchHomepageSections } from "@/content/repositories/site";
import { NewsletterSectionView } from "@/components/home/HomepageSectionViews";

export async function NewsletterSection() {
  const { newsletter } = await fetchHomepageSections();
  return <NewsletterSectionView title={newsletter.title} subtitle={newsletter.subtitle} />;
}
