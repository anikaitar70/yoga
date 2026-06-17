import { ContentSkeleton } from "@/components/ui/ContentSkeleton";
import { Container } from "@/components/ui/Container";

export function ProgramPageLoading() {
  return (
    <div className="program-page">
      <ContentSkeleton layout="hero" className="border-b border-border/40" />
      <section className="border-b border-border/40 py-16 sm:py-20">
        <Container>
          <ContentSkeleton layout="section" count={2} />
        </Container>
      </section>
      <section className="border-b border-border/40 py-16 sm:py-20">
        <Container>
          <div className="mb-10 space-y-3">
            <div className="skeleton-shimmer h-8 w-48 rounded-sm" />
          </div>
          <ContentSkeleton layout="carousel" />
        </Container>
      </section>
      <section className="py-16 sm:py-20">
        <Container>
          <ContentSkeleton layout="testimonials" count={2} />
        </Container>
      </section>
    </div>
  );
}
