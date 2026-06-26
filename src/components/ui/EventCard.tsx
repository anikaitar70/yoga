import Image from "next/image";
import type { Event } from "@/content/types";
import { formatEventRange } from "@/lib/format";
import { slugToEventCategory } from "@/lib/event-categories";
import { eventCategoryLabel } from "@/lib/i18n/event-labels";
import { isRetreatCategory } from "@/lib/event-map";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getLocale } from "@/lib/i18n/server";
import { loadSiteConfigRowForLocale } from "@/content/repositories/site-locale";
import { uiMessage } from "@/lib/i18n/resolve";
import { localizedPath } from "@/lib/i18n/paths";
import { cn } from "@/lib/utils";

type EventCardProps = {
  event: Event;
  className?: string;
  featured?: boolean;
};

export async function EventCard({ event, className, featured }: EventCardProps) {
  const locale = await getLocale();
  const localeContent = await loadSiteConfigRowForLocale();
  const isRetreat = isRetreatCategory(event.category);
  const category = slugToEventCategory(event.category);
  const categoryLabel = eventCategoryLabel(locale, category);
  const showFeatured = featured ?? event.isFeatured;
  const contactHref = localizedPath("/contact", locale);

  return (
    <Card
      variant="elevated"
      className={cn(
        "group flex h-full flex-col p-0 transition-shadow duration-500 hover:shadow-[0_16px_48px_rgba(42,36,31,0.12)]",
        isRetreat && "ring-1 ring-primary/25",
        showFeatured && "ring-1 ring-primary/40",
        className,
      )}
    >
      {event.imageUrl ? (
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-xl">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            sizes="(max-width: 1024px) 85vw, 420px"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/35 via-transparent to-transparent" />
          {showFeatured ? (
            <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-white shadow-sm">
              {uiMessage(locale, "featured", localeContent)}
            </span>
          ) : null}
        </div>
      ) : showFeatured ? (
        <div className="border-b border-border/50 px-7 pt-6 sm:px-8">
          <span className="inline-block rounded-full bg-primary-soft px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-primary-muted">
            {uiMessage(locale, "featured", localeContent)}
          </span>
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-7 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2.5">
            <span
              className={cn(
                "inline-block rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide",
                isRetreat
                  ? "bg-primary-soft text-primary-muted"
                  : "border border-border/80 text-muted",
              )}
            >
              {categoryLabel}
            </span>
            <h3 className="font-display text-xl font-medium text-foreground sm:text-2xl">{event.title}</h3>
          </div>
          {event.price ? (
            <span className="shrink-0 text-sm font-medium text-primary-muted">{event.price}</span>
          ) : null}
        </div>
        <p className="mt-3 text-sm text-muted">{formatEventRange(event.date, event.endDate, locale)}</p>
        <p className="mt-1 text-sm text-muted">{event.location}</p>
        <p className="mt-5 flex-1 text-sm leading-relaxed text-foreground/85 line-clamp-4">{event.description}</p>
        <div className="mt-7">
          <Button href={contactHref} variant={isRetreat ? "warm" : "secondary"}>
            {isRetreat
              ? uiMessage(locale, "inquireRetreat", localeContent)
              : uiMessage(locale, "reserveSpot", localeContent)}
          </Button>
        </div>
      </div>
    </Card>
  );
}
