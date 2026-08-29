import { PageHeader } from "@/components/ui/PageHeader";
import { PageContent } from "@/components/page/PageContent";
import { ContentSkeleton } from "@/components/ui/ContentSkeleton";
import { Container } from "@/components/ui/Container";

export default function TestimonialsLoading() {
  return (
    <>
      <PageHeader title="Testimonials" subtitle="Words from the studio community." />
      <PageContent>
        <Container className="py-12">
          <ContentSkeleton layout="testimonials" count={8} />
        </Container>
      </PageContent>
    </>
  );
}
