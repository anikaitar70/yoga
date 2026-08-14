import { z } from "zod";
import type { PageSectionType } from "@/lib/page-section-types";
import type { SectionLayoutSettings } from "@/lib/section-layout";
import type { LocalePageSectionPatch } from "@/lib/i18n/locale-content";

export type SpecialEventTocMode = "AUTOMATIC" | "CUSTOM";

export type EventPageSectionRecord = {
  id: string;
  eventId: string;
  sectionType: PageSectionType;
  anchorSlug: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  sortOrder: number;
  isPublished: boolean;
  layout: SectionLayoutSettings | null;
  payload: Record<string, unknown> | null;
  jaLocale?: LocalePageSectionPatch | null;
};

export type SpecialEventTocItem = {
  id: string;
  label: string;
  sectionId: string;
  anchorSlug: string;
  visible: boolean;
  sortOrder: number;
};

export type SpecialEventTocOverride = {
  items: SpecialEventTocItem[];
};

const tocItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  sectionId: z.string().min(1),
  anchorSlug: z.string().min(1).optional(),
  visible: z.boolean().default(true),
  sortOrder: z.number().int().min(0),
});

export const specialEventTocOverrideSchema = z.object({
  items: z.array(tocItemSchema),
});

export function parseSpecialEventTocOverride(value: unknown): SpecialEventTocOverride | null {
  if (!value || typeof value !== "object") return null;
  const parsed = specialEventTocOverrideSchema.safeParse(value);
  if (!parsed.success) return null;
  return {
    items: parsed.data.items.map((item) => ({
      ...item,
      anchorSlug: item.anchorSlug ?? item.sectionId,
    })),
  };
}

export function slugifyAnchor(value: string): string {
  const base = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base ? `section-${base}` : "section";
}

export function generateAnchorSlug(title: string | null | undefined, existing: string[]): string {
  const base = slugifyAnchor(title?.trim() || "section");
  if (!existing.includes(base)) return base;
  let index = 2;
  while (existing.includes(`${base}-${index}`)) {
    index += 1;
  }
  return `${base}-${index}`;
}

export function sectionHasTocHeading(section: Pick<EventPageSectionRecord, "title" | "sectionType">): boolean {
  return Boolean(section.title?.trim());
}

export function buildAutomaticTocItems(sections: EventPageSectionRecord[]): SpecialEventTocItem[] {
  return sections
    .filter((section) => section.isPublished && sectionHasTocHeading(section))
    .map((section, index) => ({
      id: section.id,
      label: section.title!.trim(),
      sectionId: section.id,
      anchorSlug: section.anchorSlug,
      visible: true,
      sortOrder: index,
    }));
}

export function buildSpecialEventToc(
  sections: EventPageSectionRecord[],
  mode: SpecialEventTocMode,
  override: SpecialEventTocOverride | null,
): SpecialEventTocItem[] {
  const published = sections.filter((section) => section.isPublished);
  if (mode === "CUSTOM" && override?.items?.length) {
    const sectionById = new Map(published.map((section) => [section.id, section]));
    return override.items
      .filter((item) => item.visible && sectionById.has(item.sectionId))
      .map((item) => {
        const section = sectionById.get(item.sectionId)!;
        return {
          ...item,
          anchorSlug: item.anchorSlug ?? section.anchorSlug,
        };
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }
  return buildAutomaticTocItems(published);
}

export { specialEventPublicPath } from "@/lib/event-slug";

export function eventHasSpecialPage(input: {
  isSpecialEvent: boolean;
  published: boolean;
  pageSectionCount?: number;
}): boolean {
  return Boolean(input.isSpecialEvent && input.published && (input.pageSectionCount ?? 0) > 0);
}

export function mapEventPageSection(record: {
  id: string;
  eventId: string;
  sectionType: string;
  anchorSlug: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  sortOrder: number;
  isPublished: boolean;
  layout: unknown;
  payload: unknown;
  jaLocale?: unknown;
}): EventPageSectionRecord {
  return {
    id: record.id,
    eventId: record.eventId,
    sectionType: record.sectionType as PageSectionType,
    anchorSlug: record.anchorSlug,
    title: record.title,
    subtitle: record.subtitle,
    content: record.content,
    imageUrl: record.imageUrl,
    imageAlt: record.imageAlt,
    sortOrder: record.sortOrder,
    isPublished: record.isPublished,
    layout: (record.layout as SectionLayoutSettings | null) ?? null,
    payload: (record.payload as Record<string, unknown> | null) ?? null,
    jaLocale: (record.jaLocale as LocalePageSectionPatch | null) ?? null,
  };
}

export function eventPageSectionToPageSectionRecord(
  section: EventPageSectionRecord,
): import("@/lib/page-section-types").PageSectionRecord {
  return {
    id: section.id,
    pageType: "ABOUT",
    sectionType: section.sectionType,
    title: section.title,
    subtitle: section.subtitle,
    content: section.content,
    imageUrl: section.imageUrl,
    imageAlt: section.imageAlt,
    sortOrder: section.sortOrder,
    isPublished: section.isPublished,
    layout: section.layout,
    payload: section.payload,
  };
}
