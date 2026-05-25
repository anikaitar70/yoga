import type { Event } from "@/content/types";
import { formatEventRange } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type EventCardProps = {
  event: Event;
};

export function EventCard({ event }: EventCardProps) {
  return (
    <Card className="flex flex-col p-6 sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-xl font-medium text-foreground">
          {event.title}
        </h3>
        <span className="text-sm font-medium text-accent">{event.price}</span>
      </div>
      <p className="mt-2 text-sm text-muted">
        {formatEventRange(event.date, event.endDate)}
      </p>
      <p className="mt-1 text-sm text-muted">{event.location}</p>
      <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground/90">
        {event.description}
      </p>
      <div className="mt-6">
        <Button href="/contact" variant="secondary">
          Reserve a spot
        </Button>
      </div>
    </Card>
  );
}
