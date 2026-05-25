import type { Event } from "@/content/types";
import { EventCard } from "@/components/ui/EventCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

type EventListProps = {
  events: Event[];
  className?: string;
};

export function EventList({ events, className }: EventListProps) {
  if (events.length === 0) {
    return (
      <EmptyState
        title="No upcoming events"
        description="Check back soon for workshops, immersions, and studio gatherings."
        actionLabel="Contact the studio"
        actionHref="/contact"
      />
    );
  }

  return (
    <div
      className={cn("grid gap-6 lg:grid-cols-2", className)}
    >
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
