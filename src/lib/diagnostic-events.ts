import type { DiagnosticCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

export type DiagnosticEventRow = {
  id: string;
  category: DiagnosticCategory;
  message: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export async function getDiagnosticEvents(
  category: DiagnosticCategory,
  page = 1,
): Promise<{ events: DiagnosticEventRow[]; total: number; page: number; pageSize: number }> {
  const safePage = Math.max(1, page);
  const skip = (safePage - 1) * PAGE_SIZE;

  const [events, total] = await Promise.all([
    prisma.appDiagnosticEvent.findMany({
      where: { category },
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
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
    pageSize: PAGE_SIZE,
  };
}
