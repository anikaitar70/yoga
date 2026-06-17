import { fetchFeaturedEvents } from "@/content";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { EventList } from "@/components/content/EventList";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export async function EventsPreview() {
  const preview = await fetchFeaturedEvents(3);

  return (
    <Section border="subtle" variant="muted" spacing="loose">
      <Container>
        <ScrollReveal animation="rise">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Gatherings"
              title="Upcoming workshops"
              subtitle="Workshops and immersions where movement meets creativity."
            />
            <Button href="/events" variant="ghost" className="hidden sm:inline-flex">
              View all events →
            </Button>
          </div>
        </ScrollReveal>
        <ScrollReveal animation="fade" delay={200}>
          <div className="mt-14">
            <EventList events={preview} />
          </div>
        </ScrollReveal>
        <div className="mt-10 sm:hidden">
          <Button href="/events" variant="secondary" className="w-full">
            View all events
          </Button>
        </div>
      </Container>
    </Section>
  );
}
