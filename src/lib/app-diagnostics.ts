import type { DiagnosticCategory, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type { DiagnosticCategory };

export function recordDiagnosticEvent(
  category: DiagnosticCategory,
  message: string,
  metadata?: Record<string, unknown>,
): void {
  void prisma.appDiagnosticEvent
    .create({
      data: {
        category,
        message,
        metadata: metadata as Prisma.InputJsonValue | undefined,
      },
    })
    .catch(() => undefined);
}

export function recordCmsSaveFailure(entityType: string, error: unknown): void {
  const reason = error instanceof Error ? error.message : "Unknown error";
  recordDiagnosticEvent("CMS_SAVE_FAILURE", `Failed to save ${entityType}`, {
    entityType,
    reason,
  });
}
