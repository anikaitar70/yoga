import type { Metadata } from "next";
import { pageIntros, fetchSite } from "@/content";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageContent } from "@/components/page/PageContent";
import { ContactDetails } from "@/components/content/ContactDetails";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach Nirvana Yoga by message, email, or phone—studio hours and location.",
};

export default async function ContactPage() {
  const site = await fetchSite();

  return (
    <>
      <PageHeader {...pageIntros.contact} />
      <PageContent>
        <div className="grid gap-12 lg:grid-cols-2">
          <ContactDetails showNote contact={site.contact} social={site.social} />
          <ContactForm />
        </div>
      </PageContent>
    </>
  );
}
