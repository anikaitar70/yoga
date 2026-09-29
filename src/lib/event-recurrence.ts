import {
  addDays,
  addMonths,
  addWeeks,
  endOfDay,
  endOfWeek,
  getDaysInMonth,
  isAfter,
  isBefore,
  setDate,
  startOfDay,
  startOfWeek,
} from "date-fns";
import type { Event } from "@/content/types";

export type RecurrenceFrequency = "WEEKLY" | "BIWEEKLY" | "MONTHLY";

export type RecurringEventInput = {
  startsAt: Date;
  recurrenceFrequency: RecurrenceFrequency | null;
  recurrenceEndDate: Date | null;
  recurrencePauseStart: Date | null;
  recurrencePauseEnd: Date | null;
  /** Weekly/biweekly only — which weekdays occurrences fall on (0=Sunday..6=Saturday). Empty/omitted = single weekday from startsAt. */
  recurrenceDaysOfWeek?: number[] | null;
};

const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function ordinal(day: number): string {
  const rem100 = day % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

/** Weekdays (0=Sun..6=Sat) an event recurs on. Falls back to startsAt's own weekday when none are explicitly set. */
function daysOfWeekForEvent(event: RecurringEventInput): number[] {
  const configured = event.recurrenceDaysOfWeek?.filter((day) => day >= 0 && day <= 6) ?? [];
  if (configured.length === 0) return [event.startsAt.getDay()];
  return [...new Set(configured)].sort((a, b) => a - b);
}

function withTimeOfDay(date: Date, reference: Date): Date {
  const result = new Date(date);
  result.setHours(
    reference.getHours(),
    reference.getMinutes(),
    reference.getSeconds(),
    reference.getMilliseconds(),
  );
  return result;
}

function isWithinPause(date: Date, event: RecurringEventInput): boolean {
  if (!event.recurrencePauseStart || !event.recurrencePauseEnd) return false;
  return !isBefore(date, startOfDay(event.recurrencePauseStart)) && !isAfter(date, endOfDay(event.recurrencePauseEnd));
}

function isPastStop(date: Date, event: RecurringEventInput): boolean {
  return Boolean(event.recurrenceEndDate && isAfter(date, event.recurrenceEndDate));
}

/** Weekly/biweekly expansion — one or more weekdays per cycle. */
function expandWeeklyOccurrences(event: RecurringEventInput, rangeStart: Date, rangeEnd: Date): Date[] {
  const days = daysOfWeekForEvent(event);
  const intervalWeeks = event.recurrenceFrequency === "BIWEEKLY" ? 2 : 1;
  const occurrences: Date[] = [];

  let weekCursor = startOfWeek(event.startsAt);
  let guard = 0;
  while (isBefore(endOfWeek(weekCursor), rangeStart) && guard < 5000) {
    weekCursor = addWeeks(weekCursor, intervalWeeks);
    guard += 1;
  }

  guard = 0;
  while (!isAfter(weekCursor, rangeEnd) && guard < 2000) {
    for (const day of days) {
      const candidate = withTimeOfDay(addDays(weekCursor, day), event.startsAt);
      if (isBefore(candidate, rangeStart) || isAfter(candidate, rangeEnd)) continue;
      if (isPastStop(candidate, event)) continue;
      if (isWithinPause(candidate, event)) continue;
      occurrences.push(candidate);
    }
    weekCursor = addWeeks(weekCursor, intervalWeeks);
    guard += 1;
  }

  occurrences.sort((a, b) => a.getTime() - b.getTime());
  return occurrences;
}

/** Monthly expansion — same day-of-month as startsAt, clamped to the last day of a shorter month. */
function expandMonthlyOccurrences(event: RecurringEventInput, rangeStart: Date, rangeEnd: Date): Date[] {
  const anchorDay = event.startsAt.getDate();
  const occurrences: Date[] = [];

  let cursor = event.startsAt;
  let guard = 0;
  while (isBefore(cursor, rangeStart) && guard < 2000) {
    const next = addMonths(cursor, 1);
    cursor = setDate(next, Math.min(anchorDay, getDaysInMonth(next)));
    guard += 1;
  }

  guard = 0;
  while (!isAfter(cursor, rangeEnd) && guard < 500) {
    if (isPastStop(cursor, event)) break;
    if (!isWithinPause(cursor, event)) {
      occurrences.push(cursor);
    }
    const next = addMonths(cursor, 1);
    cursor = setDate(next, Math.min(anchorDay, getDaysInMonth(next)));
    guard += 1;
  }

  return occurrences;
}

/**
 * Expands a recurring event into concrete occurrence dates within [rangeStart, rangeEnd] (inclusive),
 * skipping any date inside the pause window and stopping at recurrenceEndDate.
 */
export function expandRecurringOccurrences(event: RecurringEventInput, rangeStart: Date, rangeEnd: Date): Date[] {
  if (!event.recurrenceFrequency) return [];
  if (event.recurrenceFrequency === "MONTHLY") {
    return expandMonthlyOccurrences(event, rangeStart, rangeEnd);
  }
  return expandWeeklyOccurrences(event, rangeStart, rangeEnd);
}

/** Next upcoming occurrence at/after `from` (searches up to 2 years ahead), or null if the recurrence has ended. */
export function getNextOccurrence(event: RecurringEventInput, from: Date): Date | null {
  const horizon = addMonths(from, 24);
  return expandRecurringOccurrences(event, from, horizon)[0] ?? null;
}

/**
 * Occurrence dates for a public-facing Event within [rangeStart, rangeEnd] — used by the events calendar.
 * ON_REQUEST events have no fixed date and are excluded.
 */
export function getEventCalendarOccurrences(event: Event, rangeStart: Date, rangeEnd: Date): Date[] {
  if (event.eventType === "ON_REQUEST") return [];

  if (event.eventType === "RECURRING" && event.recurrenceFrequency && event.recurrenceAnchorDate) {
    return expandRecurringOccurrences(
      {
        startsAt: new Date(event.recurrenceAnchorDate),
        recurrenceFrequency: event.recurrenceFrequency,
        recurrenceEndDate: event.recurrenceEndDate ? new Date(event.recurrenceEndDate) : null,
        recurrencePauseStart: event.recurrencePauseStart ? new Date(event.recurrencePauseStart) : null,
        recurrencePauseEnd: event.recurrencePauseEnd ? new Date(event.recurrencePauseEnd) : null,
        recurrenceDaysOfWeek: event.recurrenceDaysOfWeek ?? null,
      },
      rangeStart,
      rangeEnd,
    );
  }

  const eventDate = new Date(event.date);
  return eventDate >= rangeStart && eventDate <= rangeEnd ? [eventDate] : [];
}

/** Human-readable recurrence description for badges/cards, e.g. "Every Monday", "Every Monday & Wednesday", "Monthly on the 15th". */
export function describeRecurrence(event: RecurringEventInput): string | null {
  if (!event.recurrenceFrequency) return null;

  if (event.recurrenceFrequency === "MONTHLY") {
    return `Monthly on the ${ordinal(event.startsAt.getDate())}`;
  }

  const dayNames = daysOfWeekForEvent(event).map((day) => WEEKDAY_NAMES[day]);
  const dayList =
    dayNames.length <= 1 ? dayNames[0] : `${dayNames.slice(0, -1).join(", ")} & ${dayNames[dayNames.length - 1]}`;

  return event.recurrenceFrequency === "BIWEEKLY" ? `Every 2 weeks on ${dayList}` : `Every ${dayList}`;
}
