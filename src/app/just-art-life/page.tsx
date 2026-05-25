import type { Metadata } from "next";
import { fetchJustArtLifePage } from "@/content";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageContent } from "@/components/page/PageContent";
import { SplitMediaLayout } from "@/components/content/SplitMediaLayout";
import { Prose } from "@/components/ui/Prose";

export const metadata: Metadata = {
  title: "Just Art Life",
  description:
    "Creative rituals and lifestyle gatherings—where yoga meets ink, clay, and everyday beauty.",
};

export default async function JustArtLifePage() {
  const page = await fetchJustArtLifePage();

  return (
    <>
      <PageHeader
        eyebrow={page.eyebrow}
        title={page.title}
        subtitle={page.subtitle}
      />
      <PageContent>
        <SplitMediaLayout
          image={{
            src: page.imageSrc,
            alt: page.imageAlt,
            aspectClass: "aspect-[16/11]",
          }}
        >
          <Prose>
            {page.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </Prose>
        </SplitMediaLayout>
      </PageContent>
    </>
  );
}
