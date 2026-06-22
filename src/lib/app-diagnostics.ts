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
  const err = error instanceof Error ? error : new Error(String(error));
  console.error(`[cms] Failed to save ${entityType}`, {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });
  recordDiagnosticEvent("CMS_SAVE_FAILURE", `Failed to save ${entityType}`, {
    entityType,
    reason: err.message,
    name: err.name,
    stack: err.stack,
  });
}
