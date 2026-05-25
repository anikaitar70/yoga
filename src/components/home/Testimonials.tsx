import { fetchTestimonials } from "@/content";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Section } from "@/components/ui/Section";
import { TestimonialList } from "@/components/content/TestimonialList";

export async function Testimonials() {
  const items = await fetchTestimonials();

  return (
    <Section border="bottom">
      <Container>
        <SectionHeading
          eyebrow="Community"
          title="Words from the studio"
          subtitle="Honest reflections—shared with permission."
          align="center"
          className="mx-auto"
        />
        <TestimonialList testimonials={items} className="mt-14" />
      </Container>
    </Section>
  );
}
