import { fetchPhilosophy } from "@/content";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export async function PhilosophySection() {
  const philosophy = await fetchPhilosophy();

  return (
    <Section border="bottom" spacing="loose">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            {philosophy.heading}
          </h2>
          <div className="mt-10 space-y-6 text-base leading-relaxed text-muted sm:text-lg">
            {philosophy.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
