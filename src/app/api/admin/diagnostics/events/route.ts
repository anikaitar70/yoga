import { NextResponse } from "next/server";
import { z } from "zod";
import {
  countDiagnosticEvents,
  deleteDiagnosticEvents,
} from "@/lib/diagnostic-events";
import { requireAdminSession } from "@/lib/require-admin-session";
import { formatZodErrors } from "@/lib/validators";

const deleteSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("selected"),
    ids: z.array(z.string().uuid()).min(1),
  }),
  z.object({
    mode: z.literal("olderThan"),
    days: z.number().int().min(1).max(3650),
  }),
  z.object({
    mode: z.literal("all"),
  }),
]);

export async function POST(request: Request) {
  const denied = await requireAdminSession();
  if (denied) return denied;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const countAction = z.object({ action: z.literal("count") }).safeParse(payload);
  if (countAction.success) {
    const parsed = deleteSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed.", details: formatZodErrors(parsed.error) },
        { status: 422 },
      );
    }

    const data = parsed.data;
    const count =
      data.mode === "selected"
        ? await countDiagnosticEvents({ ids: data.ids })
        : data.mode === "olderThan"
          ? await countDiagnosticEvents({ olderThanDays: data.days })
          : await countDiagnosticEvents();

    return NextResponse.json({ count });
  }

  const validation = deleteSchema.safeParse(payload);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Validation failed.", details: formatZodErrors(validation.error) },
      { status: 422 },
    );
  }

  const data = validation.data;
  const expectedCount =
    data.mode === "selected"
      ? await countDiagnosticEvents({ ids: data.ids })
      : data.mode === "olderThan"
        ? await countDiagnosticEvents({ olderThanDays: data.days })
        : await countDiagnosticEvents();

  const deleted =
    data.mode === "selected"
      ? await deleteDiagnosticEvents({ ids: data.ids })
      : data.mode === "olderThan"
        ? await deleteDiagnosticEvents({ olderThanDays: data.days })
        : await deleteDiagnosticEvents({ all: true });

  return NextResponse.json({ deleted, expectedCount });
}
