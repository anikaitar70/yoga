import type { Event } from "@/content/types";
import { EventCard } from "@/components/ui/EventCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { HorizontalScrollItem, HorizontalScrollRail } from "@/components/ui/HorizontalScrollRail";
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
    <HorizontalScrollRail
      variant="event"
      itemCount={events.length}
      as="div"
      className={className}
      aria-label="Events"
    >
      {events.map((event) => (
        <HorizontalScrollItem key={event.id} variant="event" as="div">
          <EventCard event={event} className="h-full" />
        </HorizontalScrollItem>
      ))}
    </HorizontalScrollRail>
  );
}
