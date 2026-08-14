"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { EventDetailPanel } from "@/components/content/EventDetailPanel";
import { slugToEventCategory } from "@/lib/event-categories";
import { eventCategoryLabel } from "@/lib/i18n/event-labels";
import { isRetreatCategory } from "@/lib/event-map";
import { eventDetailHasReadableContent } from "@/lib/event-detail";
import { specialEventPublicPath } from "@/lib/event-page-section";
import type { Locale } from "@/lib/i18n/locale";
import { uiMessage } from "@/lib/i18n/resolve";
import { isLocalUploadUrl } from "@/lib/upload-url";
import { localizedPath } from "@/lib/i18n/paths";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { EventsPageEventItem } from "@/lib/events-page-listing";

type EventsPageEventRowProps = {
  event: EventsPageEventItem;
  locale: Locale;
  localeContent?: unknown;
  variant?: "special" | "regular";
};

export function EventsPageEventRow({
  event,
  locale,
  localeContent,
  variant = "regular",
}: EventsPageEventRowProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const isRetreat = isRetreatCategory(event.category);
  const category = slugToEventCategory(event.category);
  const categoryLabel = eventCategoryLabel(locale, category);
  const isSpecial = variant === "special";
  const contactHref = localizedPath("/contact", locale);
  const externalUrl = event.externalUrl?.trim() || undefined;
  const externalLinkLabel =
    event.externalLinkLabel?.trim() || uiMessage(locale, "visitEventPage", localeContent);
  const resolveContext = {
    slug: event.slug,
    title: event.title,
    jaTranslationStatus: event.jaTranslationStatus,
  };
  const isSpecialEvent = Boolean(event.isSpecialEvent);
  const specialPageHref = isSpecialEvent
    ? localizedPath(specialEventPublicPath(event.slug), locale)
    : undefined;
  const canReadMore =
    !isSpecialEvent &&
    eventDetailHasReadableContent(event.eventDetail, locale, resolveContext);
  const viewDetailsLabel = locale === "ja" ? "詳細を見る" : "View details";

  const imageContent = event.imageUrl ? (
    <>
      <Image
        src={event.imageUrl}
        alt={event.imageAlt ?? event.title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        sizes="(max-width: 768px) 100vw, 22rem"
        loading="lazy"
        unoptimized={isLocalUploadUrl(event.imageUrl)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/25 via-transparent to-transparent md:bg-gradient-to-r md:from-foreground/10 md:via-transparent" />
    </>
  ) : (
    <div className="absolute inset-0 bg-gradient-to-br from-primary-soft via-card to-background" />
  );

  const imageWrapperClassName =
    "relative aspect-[16/10] w-full shrink-0 md:aspect-auto md:w-[min(42%,22rem)] md:min-h-[16rem] lg:min-h-[18rem]";

  return (
    <>
      <article
        className={cn(
          "group overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_8px_32px_rgba(42,36,31,0.06)] transition-shadow duration-500 hover:shadow-[0_16px_48px_rgba(42,36,31,0.1)]",
          isSpecial && "border-primary/25 ring-1 ring-primary/15",
          isRetreat && !isSpecial && "ring-1 ring-primary/20",
          event.isFeatured && "ring-1 ring-primary/30",
        )}
      >
        <div className="flex flex-col md:flex-row">
          {specialPageHref ? (
            <Link
              href={specialPageHref}
              className={cn(imageWrapperClassName, "block overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent")}
              aria-label={`${event.title} — ${viewDetailsLabel}`}
            >
              {imageContent}
              {event.isFeatured ? (
                <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-white shadow-sm">
                  {uiMessage(locale, "featured", localeContent)}
                </span>
              ) : null}
            </Link>
          ) : (
            <div className={imageWrapperClassName}>
              {imageContent}
              {event.isFeatured ? (
                <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-white shadow-sm">
                  {uiMessage(locale, "featured", localeContent)}
                </span>
              ) : null}
            </div>
          )}

          <div className="flex min-w-0 flex-1 flex-col p-6 sm:p-8">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {isSpecial ? (
                  <span className="inline-block rounded-full bg-primary-soft px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-primary-muted">
                    {uiMessage(locale, "specialEvents", localeContent)}
                  </span>
                ) : null}
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
              </div>

              <h3 className="font-display text-2xl font-medium leading-tight text-foreground sm:text-3xl">
                {specialPageHref ? (
                  <Link
                    href={specialPageHref}
                    className="transition-colors hover:text-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {event.title}
                  </Link>
                ) : (
                  event.title
                )}
              </h3>

              <div className="space-y-1 text-sm text-muted">
                <p>{event.dateLabel}</p>
                <p>{event.location}</p>
              </div>

              {event.price ? (
                <p className="text-base font-medium text-primary-muted">{event.price}</p>
              ) : null}

              <p className="text-sm leading-relaxed text-foreground/85 line-clamp-3 sm:line-clamp-4">
                {event.description}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {specialPageHref ? (
                <Button href={specialPageHref} variant="primary" className="min-h-11">
                  {viewDetailsLabel}
                </Button>
              ) : canReadMore ? (
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
                <Button href={externalUrl} variant={isRetreat ? "warm" : "secondary"} external className="min-h-11">
                  {externalLinkLabel}
                </Button>
              ) : !isSpecialEvent ? (
                <Button href={contactHref} variant={isRetreat ? "warm" : "secondary"} className="min-h-11">
                  {isRetreat
                    ? uiMessage(locale, "inquireRetreat", localeContent)
                    : uiMessage(locale, "reserveSpot", localeContent)}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </article>

      <EventDetailPanel
        event={event}
        open={detailOpen && !isSpecialEvent}
        onClose={() => setDetailOpen(false)}
        locale={locale}
        localeContent={localeContent}
      />
    </>
  );
}
