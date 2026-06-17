import type { EventCategory as PrismaEventCategory } from "@prisma/client";

/** Prisma EventCategory values — single source of truth for admin forms and API validation. */
export const EVENT_CATEGORY_VALUES = [
  "YOGA",
  "HEALING",
  "JUST_ART_LIFE",
  "RETREATS_AND_TOURS",
  "RETREAT",
  "WORKSHOP",
  "TEACHER_TRAINING",
  "PHILOSOPHY",
  "YOGA_NIDRA",
] as const;

export type EventCategoryValue = (typeof EVENT_CATEGORY_VALUES)[number];

export const EVENT_CATEGORY_OPTIONS: { value: EventCategoryValue; label: string }[] = [
  { value: "YOGA", label: "Yoga" },
  { value: "YOGA_NIDRA", label: "Yoga Nidra" },
  { value: "WORKSHOP", label: "Workshop" },
  { value: "TEACHER_TRAINING", label: "Teacher Training" },
  { value: "PHILOSOPHY", label: "Philosophy" },
  { value: "HEALING", label: "Healing" },
  { value: "JUST_ART_LIFE", label: "Just Art Affaire" },
  { value: "RETREAT", label: "Retreat" },
  { value: "RETREATS_AND_TOURS", label: "Retreats and Tours" },
];

/** Categories shown on the Yoga program page and /events/yoga. */
export const YOGA_PAGE_CATEGORIES = [
  "YOGA",
  "YOGA_NIDRA",
  "WORKSHOP",
  "TEACHER_TRAINING",
  "PHILOSOPHY",
] as const satisfies readonly PrismaEventCategory[];

/** Retreat-style categories for homepage retreat rail and retreat filters. */
export const RETREAT_CATEGORIES = ["RETREAT", "RETREATS_AND_TOURS"] as const satisfies readonly PrismaEventCategory[];

export const EVENT_CATEGORY_LABELS: Record<EventCategoryValue, string> = {
  YOGA: "Yoga",
  YOGA_NIDRA: "Yoga Nidra",
  WORKSHOP: "Workshop",
  TEACHER_TRAINING: "Teacher Training",
  PHILOSOPHY: "Philosophy",
  HEALING: "Healing",
  JUST_ART_LIFE: "Just Art Affaire",
  RETREAT: "Retreat",
  RETREATS_AND_TOURS: "Retreat & Tour",
};

/** Map Prisma enum → public URL slug (events/yoga, etc.). */
export function eventCategoryToSlug(category: string): string {
  return category.toLowerCase().replace(/_/g, "-");
}

/** Map public slug → Prisma enum when needed. */
export function slugToEventCategory(slug: string): EventCategoryValue {
  const map: Record<string, EventCategoryValue> = {
    yoga: "YOGA",
    healing: "HEALING",
    "just-art-life": "JUST_ART_LIFE",
    "retreats-and-tours": "RETREATS_AND_TOURS",
    retreats: "RETREAT",
    retreat: "RETREAT",
    workshop: "WORKSHOP",
    "teacher-training": "TEACHER_TRAINING",
    philosophy: "PHILOSOPHY",
    "yoga-nidra": "YOGA_NIDRA",
    YOGA: "YOGA",
    HEALING: "HEALING",
    JUST_ART_LIFE: "JUST_ART_LIFE",
    RETREATS_AND_TOURS: "RETREATS_AND_TOURS",
    RETREAT: "RETREAT",
    WORKSHOP: "WORKSHOP",
    TEACHER_TRAINING: "TEACHER_TRAINING",
    PHILOSOPHY: "PHILOSOPHY",
    YOGA_NIDRA: "YOGA_NIDRA",
  };
  return map[slug] ?? "YOGA";
}

/** Which program pages automatically list events from each category. */
export function pageTypesForCategory(category: EventCategoryValue): string[] {
  const pages = ["events"];
  if ((YOGA_PAGE_CATEGORIES as readonly string[]).includes(category)) {
    pages.push("yoga");
  }
  if (category === "HEALING") {
    pages.push("healing");
  }
  if (category === "JUST_ART_LIFE") {
    pages.push("just-art-life");
  }
  if ((RETREAT_CATEGORIES as readonly string[]).includes(category)) {
    pages.push("retreats");
  }
  return pages;
}
