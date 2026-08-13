import { z } from "zod";

export const EVENTS_PAGE_INITIAL_COUNT_MAX = 50;

export const DEFAULT_EVENTS_PAGE_SETTINGS = {
  specialEventsInitialCount: 6,
  regularClassesInitialCount: 6,
} as const;

export type EventsPageSettings = {
  specialEventsInitialCount: number;
  regularClassesInitialCount: number;
};

export const eventsPageSettingsSchema = z.object({
  specialEventsInitialCount: z
    .number()
    .int()
    .min(1, "Must show at least 1 item")
    .max(EVENTS_PAGE_INITIAL_COUNT_MAX),
  regularClassesInitialCount: z
    .number()
    .int()
    .min(1, "Must show at least 1 item")
    .max(EVENTS_PAGE_INITIAL_COUNT_MAX),
});

export function parseEventsPageSettings(raw: unknown): EventsPageSettings {
  const parsed = eventsPageSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { ...DEFAULT_EVENTS_PAGE_SETTINGS };
  }
  return parsed.data;
}
