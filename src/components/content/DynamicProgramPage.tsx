import { Suspense } from "react";
import type { PageType } from "@/lib/page-section-types";
import { fetchPageSections } from "@/content";
import { PageSectionRenderer } from "@/components/content/sections/PageSectionRenderer";
import { ProgramPageShell } from "@/components/program/ProgramPageShell";
import { ProgramPageEmptyState } from "@/components/program/ProgramPageEmptyState";
import { ProgramPageLoading } from "@/components/program/ProgramPageLoading";
import { SectionSkeleton } from "@/components/ui/SectionSkeleton";

type DynamicProgramPageProps = {
  pageType: PageType;
};

async function ProgramPageContent({ pageType }: DynamicProgramPageProps) {
  const sections = await fetchPageSections(pageType);

  if (sections.length === 0) {
    return <ProgramPageEmptyState pageType={pageType} />;
  }

  return (
    <>
      {sections.map((section, index) => (
        <Suspense
          key={section.id}
          fallback={<SectionSkeleton sectionType={section.sectionType} />}
        >
          <PageSectionRenderer section={section} pageType={pageType} sectionIndex={index} />
        </Suspense>
      ))}
    </>
  );
}

export function DynamicProgramPage({ pageType }: DynamicProgramPageProps) {
  return (
    <ProgramPageShell pageType={pageType}>
      <Suspense fallback={<ProgramPageLoading />}>
        <ProgramPageContent pageType={pageType} />
      </Suspense>
    </ProgramPageShell>
  );
}
