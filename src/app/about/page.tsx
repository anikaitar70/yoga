import type { Metadata } from "next";
import { fetchAboutPage } from "@/content";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageContent } from "@/components/page/PageContent";
import { SplitMediaLayout } from "@/components/content/SplitMediaLayout";
import { Prose } from "@/components/ui/Prose";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn how Nirvana Yoga blends mindful movement with creative living and community care.",
};

export default async function AboutPage() {
  const page = await fetchAboutPage();

  return (
    <div className="border-b border-border">
      <PageHeader
        eyebrow={page.eyebrow}
        title={page.title}
        subtitle={page.subtitle}
        titleAs="h1"
      />
      <PageContent>
        <SplitMediaLayout
          image={{
            src: page.imageSrc,
            alt: page.imageAlt,
          }}
          align="start"
        >
          <Prose>
            {page.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </Prose>
        </SplitMediaLayout>
      </PageContent>
    </div>
  );
}
