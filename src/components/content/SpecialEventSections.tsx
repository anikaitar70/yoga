import { Suspense } from "react";
import type { EventPageSectionRecord } from "@/lib/event-page-section";
import { eventPageSectionToPageSectionRecord } from "@/lib/event-page-section";
import { PageSectionRenderer } from "@/components/content/sections/PageSectionRenderer";
import { SectionSkeleton } from "@/components/ui/SectionSkeleton";

type Props = {
  sections: EventPageSectionRecord[];
};

export function SpecialEventSections({ sections }: Props) {
  return (
    <>
      {sections.map((section, index) => (
        <section
          key={section.id}
          id={section.anchorSlug}
          className="scroll-mt-28 border-b border-border/60 last:border-b-0"
        >
          <Suspense fallback={<SectionSkeleton sectionType={section.sectionType} />}>
            <PageSectionRenderer
              section={eventPageSectionToPageSectionRecord(section)}
              pageType="ABOUT"
              sectionIndex={index}
            />
          </Suspense>
        </section>
      ))}
    </>
  );
}
