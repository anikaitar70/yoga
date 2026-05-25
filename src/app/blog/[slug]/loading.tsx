import { Container } from "@/components/ui/Container";
import { PageContent } from "@/components/page/PageContent";
import { Section } from "@/components/ui/Section";
import { ContentSkeleton } from "@/components/ui/ContentSkeleton";

export default function BlogPostLoading() {
  return (
    <article className="border-b border-border">
      <Section as="header" variant="muted" spacing="pageHero" border="bottom">
        <Container>
          <div className="h-4 w-24 animate-pulse rounded-sm bg-border/60" aria-hidden />
          <div className="mt-4 h-12 max-w-3xl animate-pulse rounded-sm bg-border/60" aria-hidden />
          <div className="mt-6 h-6 max-w-2xl animate-pulse rounded-sm bg-border/60" aria-hidden />
        </Container>
      </Section>
      <div className="aspect-[21/9] w-full max-h-[min(56vh,520px)] animate-pulse bg-border/40" aria-hidden />
      <PageContent border="bottom">
        <ContentSkeleton layout="events" count={3} className="mx-auto max-w-2xl" />
      </PageContent>
    </article>
  );
}
