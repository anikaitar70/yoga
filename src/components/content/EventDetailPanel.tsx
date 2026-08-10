"use client";

import { useEffect, useId, useMemo, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Event } from "@/content/types";
import { EventDetailSections } from "@/components/content/EventDetailSections";
import { Button } from "@/components/ui/Button";
import { formatEventRange } from "@/lib/format";
import { eventDetailHasReadableContent, resolveEventDetail, type EventDetailResolveContext } from "@/lib/event-detail";
import type { Locale } from "@/lib/i18n/locale";
import { uiMessage } from "@/lib/i18n/resolve";
import { cn } from "@/lib/utils";

type EventDetailPanelProps = {
  event: Event;
  open: boolean;
  onClose: () => void;
  locale: Locale;
  localeContent?: unknown;
  /** When true, skip portal-like fixed overlay styling tweaks for admin preview. */
  preview?: boolean;
  /** Admin preview locale when preview=true. */
  previewLocale?: Locale;
};

export function EventDetailPanel({
  event,
  open,
  onClose,
  locale,
  localeContent,
  preview = false,
  previewLocale = "en",
}: EventDetailPanelProps) {
  const titleId = useId();
  const descriptionId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const activeLocale = preview ? previewLocale : locale;
  const resolveContext: EventDetailResolveContext = {
    slug: event.slug,
    title: event.title,
    jaTranslationStatus: event.jaTranslationStatus,
  };
  const resolved = useMemo(
    () => (event.eventDetail ? resolveEventDetail(event.eventDetail, activeLocale, resolveContext) : null),
    [event.eventDetail, event.slug, event.title, event.jaTranslationStatus, activeLocale],
  );
  const show =
    open &&
    Boolean(event.eventDetail) &&
    (preview
      ? event.eventDetail?.enabled
      : eventDetailHasReadableContent(event.eventDetail, activeLocale, resolveContext));

  useEffect(() => {
    if (!show) return;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarGap = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarGap > 0) {
      document.body.style.paddingRight = `${scrollbarGap}px`;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 0);

    function onKeyDown(keyEvent: KeyboardEvent) {
      if (keyEvent.key === "Escape") {
        keyEvent.preventDefault();
        onClose();
        return;
      }
      if (keyEvent.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (keyEvent.shiftKey && document.activeElement === first) {
        keyEvent.preventDefault();
        last.focus();
      } else if (!keyEvent.shiftKey && document.activeElement === last) {
        keyEvent.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      window.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [show, onClose]);

  const registration =
    resolved?.registration?.enabled && resolved.registration.googleFormUrl
      ? resolved.registration
      : null;

  return (
    <AnimatePresence>
      {show && resolved ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <button
            type="button"
            aria-label={uiMessage(activeLocale, "closeEventDetail", localeContent)}
            className="absolute inset-0 bg-foreground/45 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            tabIndex={-1}
            className={cn(
              "relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_24px_80px_rgba(42,36,31,0.22)]",
              "sm:max-h-[90vh] sm:w-[90vw] lg:w-[84vw] xl:max-w-6xl",
            )}
            initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 12, scale: 0.99 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(clickEvent) => clickEvent.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border/60 px-5 py-4 sm:px-8 sm:py-5">
              <div className="min-w-0 space-y-1.5">
                {resolved.subtitle ? (
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-primary-muted">
                    {resolved.subtitle}
                  </p>
                ) : null}
                <h2 id={titleId} className="font-display text-2xl font-medium text-foreground sm:text-3xl">
                  {event.title}
                </h2>
                <p id={descriptionId} className="text-sm text-muted">
                  {formatEventRange(event.date, event.endDate, activeLocale)}
                  {event.location ? ` · ${event.location}` : ""}
                </p>
                {(resolved.usingEnglishFallback || resolved.usingMachineTranslation) ? (
                  <p className="rounded-lg border border-border/60 bg-surface-warm/50 px-3 py-2 text-xs text-muted">
                    {uiMessage(activeLocale, "translationDisclaimer", localeContent)}
                  </p>
                ) : null}
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary/40 hover:text-primary-muted"
                aria-label={uiMessage(activeLocale, "closeEventDetail", localeContent)}
              >
                {uiMessage(activeLocale, "close", localeContent)}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-8 sm:py-8">
              {resolved.sections.length > 0 ? (
                <EventDetailSections detail={resolved} />
              ) : (
                <ProseFallback description={event.description} />
              )}
            </div>

            {registration ? (
              <div className="border-t border-border/60 bg-surface-warm/40 px-5 py-4 sm:px-8 sm:py-5">
                <Button
                  href={registration.googleFormUrl}
                  variant="warm"
                  className="w-full sm:w-auto"
                  ariaLabel={registration.label}
                  external
                >
                  {registration.label}
                </Button>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function ProseFallback({ description }: { description: string }) {
  return <p className="max-w-2xl text-base leading-[var(--leading-calm)] text-muted">{description}</p>;
}
