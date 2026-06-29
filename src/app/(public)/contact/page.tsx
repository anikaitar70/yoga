import type { Metadata } from "next";
import { fetchPageIntro, fetchSite } from "@/content";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageContent } from "@/components/page/PageContent";
import { ContactDetails } from "@/components/content/ContactDetails";
import { ContactForm } from "@/components/contact/ContactForm";
import { buildStaticPageMetadata } from "@/lib/seo/build-static-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata("contact");
}

export default async function ContactPage() {
  const [site, intro] = await Promise.all([fetchSite(), fetchPageIntro("contact")]);

  return (
    <>
      <PageHeader {...intro} titleAs="h1" />
      <PageContent>
        <div className="grid gap-12 lg:grid-cols-2">
          <ContactDetails showNote contact={site.contact} social={site.social} />
          <ContactForm />
        </div>
      </PageContent>
    </>
  );
}
