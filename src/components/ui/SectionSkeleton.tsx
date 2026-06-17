import type { ReactNode } from "react";
import type { PageSectionType } from "@/lib/page-section-types";
import { ContentSkeleton } from "@/components/ui/ContentSkeleton";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

type SectionSkeletonProps = {
  sectionType: PageSectionType;
  className?: string;
};

function SectionShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cn("border-b border-border/40 py-16 sm:py-20", className)}>
      <Container>{children}</Container>
    </section>
  );
}

export function SectionSkeleton({ sectionType, className }: SectionSkeletonProps) {
  switch (sectionType) {
    case "HERO":
      return <ContentSkeleton layout="hero" className={className} />;
    case "GALLERY":
      return (
        <SectionShell className={className}>
          <div className="mb-10 space-y-3">
            <div className="skeleton-shimmer h-8 w-48 rounded-sm" />
            <div className="skeleton-shimmer h-4 w-72 max-w-full rounded-sm" />
          </div>
          <ContentSkeleton layout="carousel" />
        </SectionShell>
      );
    case "TESTIMONIALS":
      return (
        <SectionShell className={className}>
          <div className="mb-12 space-y-3">
            <div className="skeleton-shimmer h-8 w-56 rounded-sm" />
          </div>
          <ContentSkeleton layout="testimonials" count={2} />
        </SectionShell>
      );
    case "EVENTS":
      return (
        <SectionShell className={className}>
          <div className="mb-10 space-y-3">
            <div className="skeleton-shimmer h-8 w-44 rounded-sm" />
          </div>
          <ContentSkeleton layout="events" count={2} />
        </SectionShell>
      );
    case "IMAGE_TEXT":
    case "CUSTOM_TEXT":
      return (
        <SectionShell className={className}>
          <ContentSkeleton layout="section" count={2} />
        </SectionShell>
      );
    case "CONTACT":
      return (
        <SectionShell className={className}>
          <div className="mx-auto max-w-xl space-y-4">
            <div className="skeleton-shimmer h-8 w-40 rounded-sm" />
            <div className="skeleton-shimmer h-32 w-full rounded-lg" />
            <div className="skeleton-shimmer h-10 w-32 rounded-full" />
          </div>
        </SectionShell>
      );
    default:
      return (
        <SectionShell className={className}>
          <ContentSkeleton layout="section" count={1} />
        </SectionShell>
      );
  }
}
