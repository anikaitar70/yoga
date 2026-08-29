import { z } from "zod";
import type { CSSProperties } from "react";
import type { PageSectionType } from "@/lib/page-section-types";
import type { SectionLayoutSettings } from "@/lib/section-layout";
import type { LocalePageSectionPatch } from "@/lib/i18n/locale-content";
import { SITE_FONT_IDS, resolveFontCssVariable, type SiteFontId } from "@/lib/site-fonts";

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

export type SpecialEventTocDesign = {
  fontFamily?: SiteFontId;
  fontWeight?: string;
  color?: string;
  fontSize?: string;
  background?: string;
  fontStyle?: "normal" | "italic";
  textDecoration?: "none" | "underline";
  highlightColor?: string;
  textAlign?: "left" | "center" | "right";
  lineHeight?: string;
  letterSpacing?: string;
  itemSpacing?: "compact" | "normal" | "relaxed" | "custom";
  itemSpacingCustom?: string;
};

export type SpecialEventTocOverride = {
  items: SpecialEventTocItem[];
  design?: SpecialEventTocDesign | null;
};

const tocItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  sectionId: z.string().min(1),
  anchorSlug: z.string().min(1).optional(),
  visible: z.boolean().default(true),
  sortOrder: z.number().int().min(0),
});

const tocDesignSchema = z.object({
  fontFamily: z.enum(SITE_FONT_IDS).optional(),
  fontWeight: z.enum(["300", "400", "500", "600", "700"]).optional(),
  color: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Invalid hex color").optional(),
  fontSize: z.string().regex(/^\d{1,3}px$/, "Font size must be like 16px").optional(),
  background: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Invalid hex color").optional(),
  fontStyle: z.enum(["normal", "italic"]).optional(),
  textDecoration: z.enum(["none", "underline"]).optional(),
  highlightColor: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Invalid hex color").optional(),
  textAlign: z.enum(["left", "center", "right"]).optional(),
  lineHeight: z.string().regex(/^\d(\.\d)?$/, "e.g. 1.5").optional(),
  letterSpacing: z.string().regex(/^-?\d(\.\d)?px$/, "e.g. 0.5px").optional(),
  itemSpacing: z.enum(["compact", "normal", "relaxed", "custom"]).optional(),
  itemSpacingCustom: z.string().regex(/^\d{1,3}px$/, "e.g. 12px").optional(),
});

export const specialEventTocOverrideSchema = z.object({
  items: z.array(tocItemSchema),
  design: tocDesignSchema.optional().nullable(),
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
    design: parsed.data.design ?? null,
  };
}

export function tocDesignToStyle(design?: SpecialEventTocDesign | null): CSSProperties | undefined {
  if (!design) return undefined;
  const style: CSSProperties = {};
  if (design.fontFamily) style.fontFamily = resolveFontCssVariable(design.fontFamily as SiteFontId);
  if (design.fontWeight) style.fontWeight = design.fontWeight;
  if (design.color) style.color = design.color;
  if (design.fontSize) style.fontSize = design.fontSize;
  if (design.fontStyle) style.fontStyle = design.fontStyle;
  if (design.textDecoration) style.textDecoration = design.textDecoration;
  if (design.highlightColor) style.backgroundColor = design.highlightColor;
  if (design.textAlign) style.textAlign = design.textAlign as CSSProperties["textAlign"];
  if (design.lineHeight) style.lineHeight = design.lineHeight;
  if (design.letterSpacing) style.letterSpacing = design.letterSpacing;
  return Object.keys(style).length > 0 ? style : undefined;
}

export function tocDesignToContainerStyle(design?: SpecialEventTocDesign | null): CSSProperties | undefined {
  if (!design?.background) return undefined;
  return { backgroundColor: design.background };
}

export function tocDesignToListStyle(design?: SpecialEventTocDesign | null): CSSProperties | undefined {
  if (!design?.itemSpacing) return undefined;
  const map: Record<string, string> = { compact: "4px", normal: "8px", relaxed: "16px" };
  const gap = design.itemSpacing === "custom" ? design.itemSpacingCustom ?? "8px" : map[design.itemSpacing] ?? "8px";
  return { display: "flex", flexDirection: "column", gap };
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
