import { fetchFeaturedEvents } from "@/content";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { EventList } from "@/components/content/EventList";

export async function EventsPreview() {
  const preview = await fetchFeaturedEvents(2);

  return (
    <Section border="bottom" className="bg-accent-soft/40">
      <Container>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Gatherings"
            title="Upcoming events"
            subtitle="Workshops and immersions where movement meets creativity."
          />
          <Button href="/events" variant="ghost" className="hidden sm:inline-flex">
            View all events
          </Button>
        </div>
        <div className="mt-12">
          <EventList events={preview} />
        </div>
        <div className="mt-8 sm:hidden">
          <Button href="/events" variant="secondary" className="w-full">
            View all events
          </Button>
        </div>
      </Container>
    </Section>
  );
}
