"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import type { Event } from "@/content/types";
import type { DesignEventCategoryColors } from "@/lib/design-settings";
import { getEventCalendarOccurrences } from "@/lib/event-recurrence";
import { slugToEventCategory } from "@/lib/event-categories";
import { eventCategoryLabel } from "@/lib/i18n/event-labels";
import { specialEventPublicPath } from "@/lib/event-page-section";
import { localizedPath } from "@/lib/i18n/paths";
import { Button } from "@/components/ui/Button";
import type { Locale } from "@/lib/i18n/locale";
import { cn } from "@/lib/utils";

type CalendarOccurrence = {
  event: Event;
  date: Date;
};

type EventsCalendarProps = {
  events: Event[];
  locale: Locale;
  eventCategoryColors?: DesignEventCategoryColors;
};

const WEEKDAY_LABELS_EN = ["S", "M", "T", "W", "T", "F", "S"];
const WEEKDAY_LABELS_JA = ["日", "月", "火", "水", "木", "金", "土"];

function occurrencesByDay(events: Event[], monthAnchor: Date): Map<string, CalendarOccurrence[]> {
  const rangeStart = startOfWeek(startOfMonth(monthAnchor));
  const rangeEnd = endOfWeek(endOfMonth(monthAnchor));
  const map = new Map<string, CalendarOccurrence[]>();

  for (const event of events) {
    const dates = getEventCalendarOccurrences(event, rangeStart, rangeEnd);
    for (const date of dates) {
      const key = format(date, "yyyy-MM-dd");
      const existing = map.get(key) ?? [];
      existing.push({ event, date });
      map.set(key, existing);
    }
  }

  return map;
}

function MonthGrid({
  monthAnchor,
  occurrences,
  locale,
  eventCategoryColors,
  compact,
  onSelectEvent,
}: {
  monthAnchor: Date;
  occurrences: Map<string, CalendarOccurrence[]>;
  locale: Locale;
  eventCategoryColors?: DesignEventCategoryColors;
  compact: boolean;
  onSelectEvent: (occurrence: CalendarOccurrence) => void;
}) {
  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(monthAnchor)),
        end: endOfWeek(endOfMonth(monthAnchor)),
      }),
    [monthAnchor],
  );
  const weekdayLabels = locale === "ja" ? WEEKDAY_LABELS_JA : WEEKDAY_LABELS_EN;
  const maxVisible = compact ? 2 : 3;

  return (
    <div className={cn("grid grid-cols-7", compact ? "gap-0.5" : "gap-1")}>
      {weekdayLabels.map((label, index) => (
        <div
          key={`${label}-${index}`}
          className={cn("pb-1 text-center font-semibold uppercase text-muted", compact ? "text-[0.65rem]" : "text-xs")}
        >
          {label}
        </div>
      ))}
      {days.map((day) => {
        const key = format(day, "yyyy-MM-dd");
        const dayOccurrences = occurrences.get(key) ?? [];
        const inMonth = isSameMonth(day, monthAnchor);
        const visible = dayOccurrences.slice(0, maxVisible);
        const overflow = dayOccurrences.length - visible.length;

        return (
          <div
            key={key}
            className={cn(
              "flex flex-col gap-0.5 rounded-lg border border-transparent text-left",
              compact ? "min-h-[1.6rem] p-0.5" : "min-h-[5.5rem] p-1 sm:min-h-[6.5rem]",
              inMonth ? "bg-card/60" : "bg-transparent opacity-40",
              isToday(day) && "border-accent/60",
            )}
          >
            <span className={cn("font-medium text-muted", compact ? "text-[0.7rem]" : "text-[0.65rem]")}>
              {format(day, "d")}
            </span>
            {compact ? (
              dayOccurrences.length > 0 ? (
                <div className="flex flex-wrap gap-0.5 px-0.5">
                  {dayOccurrences.slice(0, 4).map(({ event }, index) => {
                    const category = slugToEventCategory(event.category);
                    const color = eventCategoryColors?.[category];
                    return (
                      <span
                        key={`${event.id}-${index}`}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: color ?? "var(--muted-soft, #b8ada2)" }}
                        title={event.title}
                      />
                    );
                  })}
                </div>
              ) : null
            ) : (
              <div className="flex flex-col gap-0.5">
                {visible.map(({ event, date }, index) => {
                  const category = slugToEventCategory(event.category);
                  const color = eventCategoryColors?.[category];
                  return (
                    <button
                      key={`${event.id}-${index}`}
                      type="button"
                      onClick={() => onSelectEvent({ event, date })}
                      className="truncate rounded px-1 text-left text-[0.6rem] font-medium leading-tight text-foreground/85 transition-colors hover:bg-accent/15"
                      style={color ? { backgroundColor: `color-mix(in srgb, ${color} 22%, white)` } : { backgroundColor: "var(--muted-soft, #eee)" }}
                      title={event.title}
                    >
                      {event.title}
                    </button>
                  );
                })}
                {overflow > 0 ? (
                  <span className="px-1 text-[0.6rem] text-muted">
                    {locale === "ja" ? `+${overflow}件` : `+${overflow} more`}
                  </span>
                ) : null}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function EventOccurrenceDetail({
  occurrence,
  locale,
  onClose,
}: {
  occurrence: CalendarOccurrence;
  locale: Locale;
  onClose: () => void;
}) {
  const { event, date } = occurrence;
  const category = slugToEventCategory(event.category);
  const categoryLabel = eventCategoryLabel(locale, category);
  const isSpecialEvent = Boolean(event.isSpecialEvent);
  const specialPageHref = isSpecialEvent ? localizedPath(specialEventPublicPath(event.slug), locale) : undefined;
  const externalUrl = event.externalUrl?.trim() || undefined;
  const contactHref = localizedPath("/contact", locale);
  const dateLabel = format(date, "PPP");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/30 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="w-full max-w-md rounded-t-2xl bg-card p-6 shadow-xl sm:rounded-2xl"
        onClick={(clickEvent) => clickEvent.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-block rounded-full border border-border/80 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-muted">
              {categoryLabel}
            </span>
            <h3 className="mt-2 font-display text-xl font-medium text-foreground">{event.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={locale === "ja" ? "閉じる" : "Close"}
            className="rounded-full p-1 text-muted hover:bg-muted/10"
          >
            ✕
          </button>
        </div>
        <div className="mt-3 space-y-1 text-sm text-muted">
          <p>{event.eventType === "RECURRING" && event.recurrenceDescription ? event.recurrenceDescription : dateLabel}</p>
          <p>{event.location}</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          {specialPageHref ? (
            <Button href={specialPageHref} variant="primary" className="min-h-11">
              {locale === "ja" ? "詳細を見る" : "View details"}
            </Button>
          ) : externalUrl ? (
            <Button href={externalUrl} variant="secondary" external className="min-h-11">
              {locale === "ja" ? "登録する" : "Register"}
            </Button>
          ) : (
            <Button href={contactHref} variant="secondary" className="min-h-11">
              {locale === "ja" ? "お問い合わせ" : "Get in touch to register"}
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Small calendar preview (top-right of /events) that expands to a full-page month view on click. */
export function EventsCalendar({ events, locale, eventCategoryColors }: EventsCalendarProps) {
  const [monthAnchor, setMonthAnchor] = useState(() => startOfMonth(new Date()));
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<CalendarOccurrence | null>(null);

  const occurrences = useMemo(() => occurrencesByDay(events, monthAnchor), [events, monthAnchor]);
  const monthLabel = format(monthAnchor, "MMMM yyyy");

  useEffect(() => {
    if (!expanded && !selected) return;
    function handleEscape(keyEvent: KeyboardEvent) {
      if (keyEvent.key !== "Escape") return;
      setSelected(null);
      setExpanded(false);
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [expanded, selected]);

  function goToMonth(direction: -1 | 1) {
    setMonthAnchor((current) => (direction === 1 ? addMonths(current, 1) : subMonths(current, 1)));
  }

  const header = (
    <div className="flex items-center justify-between gap-2">
      <button
        type="button"
        onClick={() => goToMonth(-1)}
        aria-label={locale === "ja" ? "前の月" : "Previous month"}
        className="rounded-full p-1 text-muted hover:bg-muted/10"
      >
        ‹
      </button>
      <span className="text-sm font-semibold text-foreground">{monthLabel}</span>
      <button
        type="button"
        onClick={() => goToMonth(1)}
        aria-label={locale === "ja" ? "次の月" : "Next month"}
        className="rounded-full p-1 text-muted hover:bg-muted/10"
      >
        ›
      </button>
    </div>
  );

  return (
    <>
      <div className="w-full max-w-[19rem] rounded-2xl border border-border/70 bg-card/80 p-3.5 shadow-[0_4px_16px_rgba(42,36,31,0.05)]">
        {header}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setExpanded(true)}
          onKeyDown={(keyEvent) => {
            if (keyEvent.key === "Enter" || keyEvent.key === " ") {
              keyEvent.preventDefault();
              setExpanded(true);
            }
          }}
          className="mt-1.5 block w-full cursor-pointer text-left"
          aria-label={locale === "ja" ? "カレンダーを拡大" : "Expand calendar"}
        >
          <MonthGrid
            monthAnchor={monthAnchor}
            occurrences={occurrences}
            locale={locale}
            eventCategoryColors={eventCategoryColors}
            compact
            onSelectEvent={(occurrence) => {
              setExpanded(true);
              setSelected(occurrence);
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-1.5 text-xs font-medium text-primary-muted underline decoration-dotted"
        >
          {locale === "ja" ? "拡大表示" : "View full calendar"}
        </button>
      </div>

      {typeof document !== "undefined"
        ? createPortal(
            <AnimatePresence>
              {expanded ? (
                <motion.div
                  key="calendar-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-sm sm:p-8"
                  onClick={() => setExpanded(false)}
                >
                  <motion.div
                    key="calendar-card"
                    initial={{ opacity: 0, scale: 0.92, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 8 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-card p-6 shadow-2xl sm:p-8"
                    onClick={(clickEvent) => clickEvent.stopPropagation()}
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="font-display text-2xl font-medium text-foreground">
                        {locale === "ja" ? "イベントカレンダー" : "Events calendar"}
                      </h2>
                      <button
                        type="button"
                        onClick={() => setExpanded(false)}
                        aria-label={locale === "ja" ? "閉じる" : "Close"}
                        className="rounded-full p-2 text-muted hover:bg-muted/10"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="mt-6">{header}</div>
                    <div className="mt-4">
                      <MonthGrid
                        monthAnchor={monthAnchor}
                        occurrences={occurrences}
                        locale={locale}
                        eventCategoryColors={eventCategoryColors}
                        compact={false}
                        onSelectEvent={setSelected}
                      />
                    </div>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}

      {typeof document !== "undefined"
        ? createPortal(
            <AnimatePresence>
              {selected ? (
                <EventOccurrenceDetail
                  key="event-detail"
                  occurrence={selected}
                  locale={locale}
                  onClose={() => setSelected(null)}
                />
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}
