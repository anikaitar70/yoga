import { Suspense } from "react";
import type { Metadata } from "next";
import { fetchAboutPage, fetchPageSections } from "@/content";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageContent } from "@/components/page/PageContent";
import { AboutPageSectionsEmpty } from "@/components/about/AboutPageSectionsEmpty";
import { PageSectionRenderer } from "@/components/content/sections/PageSectionRenderer";
import { SectionSkeleton } from "@/components/ui/SectionSkeleton";

export const metadata: Metadata = {
  title: "About Shalini",
  description:
    "Shalini Gupta — yoga teacher, meditation guide, and wellness facilitator with 25+ years of practice rooted in traditional Indian teachings.",
};

async function AboutPageSections() {
  const sections = await fetchPageSections("ABOUT");

  if (sections.length === 0) {
    return <AboutPageSectionsEmpty />;
  }

  return (
    <>
      {sections.map((section, index) => (
        <Suspense
          key={section.id}
          fallback={<SectionSkeleton sectionType={section.sectionType} />}
        >
          <PageSectionRenderer section={section} pageType="ABOUT" sectionIndex={index} />
        </Suspense>
      ))}
    </>
  );
}

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
        <Suspense fallback={null}>
          <AboutPageSections />
        </Suspense>
      </PageContent>
    </div>
  );
}
