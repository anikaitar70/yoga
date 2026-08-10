"use client";

import { useState } from "react";
import Image from "next/image";
import type { Event } from "@/content/types";
import { EventDetailPanel } from "@/components/content/EventDetailPanel";
import { formatEventRange } from "@/lib/format";
import { slugToEventCategory } from "@/lib/event-categories";
import { eventCategoryLabel } from "@/lib/i18n/event-labels";
import { isRetreatCategory } from "@/lib/event-map";
import { eventDetailHasReadableContent } from "@/lib/event-detail";
import type { Locale } from "@/lib/i18n/locale";
import { uiMessage } from "@/lib/i18n/resolve";
import { isLocalUploadUrl } from "@/lib/upload-url";
import { localizedPath } from "@/lib/i18n/paths";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type EventCardProps = {
  event: Event;
  locale: Locale;
  localeContent?: unknown;
  className?: string;
  featured?: boolean;
};

export function EventCard({ event, locale, localeContent, className, featured }: EventCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const isRetreat = isRetreatCategory(event.category);
  const category = slugToEventCategory(event.category);
  const categoryLabel = eventCategoryLabel(locale, category);
  const showFeatured = featured ?? event.isFeatured;
  const contactHref = localizedPath("/contact", locale);
  const externalUrl = event.externalUrl?.trim() || undefined;
  const externalLinkLabel =
    event.externalLinkLabel?.trim() || uiMessage(locale, "visitEventPage", localeContent);
  const resolveContext = {
    slug: event.slug,
    title: event.title,
    jaTranslationStatus: event.jaTranslationStatus,
  };
  const canReadMore = eventDetailHasReadableContent(event.eventDetail, locale, resolveContext);

  const media = event.imageUrl ? (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-xl">
      <Image
        src={event.imageUrl}
        alt={event.imageAlt ?? event.title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        sizes="(max-width: 1024px) 85vw, 420px"
        loading="lazy"
        unoptimized={isLocalUploadUrl(event.imageUrl)}
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
  ) : null;

  const body = (
    <>
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
      <p className="mt-5 text-sm leading-relaxed text-foreground/85 line-clamp-4">{event.description}</p>
    </>
  );

  return (
    <>
      <Card
        variant="elevated"
        className={cn(
          "group flex h-full flex-col p-0 transition-shadow duration-500 hover:shadow-[0_16px_48px_rgba(42,36,31,0.12)]",
          isRetreat && "ring-1 ring-primary/25",
          showFeatured && "ring-1 ring-primary/40",
          className,
        )}
      >
        {externalUrl ? (
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-t-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label={`${event.title} — ${externalLinkLabel}`}
          >
            {media}
            <div className="p-7 pb-5 sm:p-8 sm:pb-5">{body}</div>
          </a>
        ) : (
          <>
            {media}
            <div className="p-7 pb-5 sm:p-8 sm:pb-5">{body}</div>
          </>
        )}

        <div
          className={cn(
            "mt-auto flex flex-wrap gap-3 px-7 pb-7 sm:px-8 sm:pb-8",
            externalUrl && "border-t border-border/40 pt-5",
          )}
        >
          {canReadMore ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDetailOpen(true)}
              ariaLabel={`${uiMessage(locale, "readMore", localeContent)}: ${event.title}`}
              className="min-h-11"
            >
              {uiMessage(locale, "readMore", localeContent)}
            </Button>
          ) : null}

          {externalUrl ? (
            <Button href={externalUrl} variant={isRetreat ? "warm" : "primary"} external className="min-h-11">
              {externalLinkLabel}
            </Button>
          ) : (
            <Button href={contactHref} variant={isRetreat ? "warm" : "secondary"} className="min-h-11">
              {isRetreat
                ? uiMessage(locale, "inquireRetreat", localeContent)
                : uiMessage(locale, "reserveSpot", localeContent)}
            </Button>
          )}
        </div>
      </Card>

      <EventDetailPanel
        event={event}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        locale={locale}
        localeContent={localeContent}
      />
    </>
  );
}
