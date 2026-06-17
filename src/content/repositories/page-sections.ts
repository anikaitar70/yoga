import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { PageSectionRecord, PageType } from "@/lib/page-section-types";
import type { SectionLayoutSettings } from "@/lib/section-layout";
import { resolveContent } from "@/content/utils";

function mapSection(record: {
  id: string;
  pageType: string;
  sectionType: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  sortOrder: number;
  isPublished: boolean;
  layout: unknown;
  payload: unknown;
}): PageSectionRecord {
  return {
    id: record.id,
    pageType: record.pageType as PageSectionRecord["pageType"],
    sectionType: record.sectionType as PageSectionRecord["sectionType"],
    title: record.title,
    subtitle: record.subtitle,
    content: record.content,
    imageUrl: record.imageUrl,
    imageAlt: record.imageAlt,
    sortOrder: record.sortOrder,
    isPublished: record.isPublished,
    layout: (record.layout as SectionLayoutSettings | null) ?? null,
    payload: (record.payload as PageSectionRecord["payload"]) ?? null,
  };
}

function assertPageSectionClient() {
  if (typeof prisma.pageSection?.findMany !== "function") {
    throw new Error(
      "Prisma PageSection model is unavailable. Stop the dev server, run `npm run prisma:generate`, delete `.next`, then restart.",
    );
  }
}

export const fetchPageSections = cache(async function fetchPageSections(
  pageType: PageType,
): Promise<PageSectionRecord[]> {
  assertPageSectionClient();
  const rows = await prisma.pageSection.findMany({
    where: { pageType, isPublished: true },
    orderBy: { sortOrder: "asc" },
  });
  return resolveContent(rows.map(mapSection));
});

export async function fetchAllPageSections(pageType: PageType): Promise<PageSectionRecord[]> {
  assertPageSectionClient();
  const rows = await prisma.pageSection.findMany({
    where: { pageType },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map(mapSection);
}

