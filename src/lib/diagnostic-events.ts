import type { DiagnosticCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const DIAGNOSTIC_PAGE_SIZE = 20;

export type DiagnosticEventRow = {
  id: string;
  category: DiagnosticCategory;
  message: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export async function getDiagnosticEvents(  category: DiagnosticCategory,
  page = 1,
): Promise<{ events: DiagnosticEventRow[]; total: number; page: number; pageSize: number }> {
  const safePage = Math.max(1, page);
  const skip = (safePage - 1) * DIAGNOSTIC_PAGE_SIZE;

  const [events, total] = await Promise.all([
    prisma.appDiagnosticEvent.findMany({
      where: { category },
      orderBy: { createdAt: "desc" },
      skip,
      take: DIAGNOSTIC_PAGE_SIZE,
    }),
    prisma.appDiagnosticEvent.count({ where: { category } }),
  ]);

  return {
    events: events.map((event) => ({
      id: event.id,
      category: event.category,
      message: event.message,
      metadata: (event.metadata as Record<string, unknown> | null) ?? null,
      createdAt: event.createdAt.toISOString(),
    })),
    total,
    page: safePage,
    pageSize: DIAGNOSTIC_PAGE_SIZE,
  };
}

export async function countDiagnosticEvents(filter?: {
  ids?: string[];
  olderThanDays?: number;
  category?: DiagnosticCategory;
}): Promise<number> {
  const where: {
    id?: { in: string[] };
    category?: DiagnosticCategory;
    createdAt?: { lt: Date };
  } = {};

  if (filter?.ids?.length) {
    where.id = { in: filter.ids };
  }
  if (filter?.category) {
    where.category = filter.category;
  }
  if (typeof filter?.olderThanDays === "number" && filter.olderThanDays > 0) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - filter.olderThanDays);
    where.createdAt = { lt: cutoff };
  }

  return prisma.appDiagnosticEvent.count({ where });
}

export async function deleteDiagnosticEvents(filter: {
  ids?: string[];
  olderThanDays?: number;
  all?: boolean;
}): Promise<number> {
  if (filter.all) {
    const result = await prisma.appDiagnosticEvent.deleteMany({});
    return result.count;
  }

  const where: {
    id?: { in: string[] };
    createdAt?: { lt: Date };
  } = {};

  if (filter.ids?.length) {
    where.id = { in: filter.ids };
  } else if (typeof filter.olderThanDays === "number" && filter.olderThanDays > 0) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - filter.olderThanDays);
    where.createdAt = { lt: cutoff };
  } else {
    return 0;
  }

  const result = await prisma.appDiagnosticEvent.deleteMany({ where });
  return result.count;
}
