import { fetchEvents } from "@/content";
import { EventList } from "@/components/content/EventList";

export async function EventsSection() {
  const events = await fetchEvents();
  return <EventList events={events} />;
}
