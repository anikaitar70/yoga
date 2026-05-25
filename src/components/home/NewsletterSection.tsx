import { Container } from "@/components/ui/Container";
import { NewsletterForm } from "@/components/layout/NewsletterForm";
import { Section } from "@/components/ui/Section";

export function NewsletterSection() {
  return (
    <Section variant="card" border="bottom">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-3xl font-medium text-foreground sm:text-4xl">
            Notes from the studio
          </h2>
          <p className="mt-3 text-sm text-muted">
            Monthly letters—classes, workshops, and quiet invitations.
          </p>
          <NewsletterForm id="home-newsletter" className="mt-8 text-left" />
        </div>
      </Container>
    </Section>
  );
}
