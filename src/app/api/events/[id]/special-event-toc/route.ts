import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin-session";
import { parseSpecialEventTocOverride } from "@/lib/event-page-section";
import { revalidateSpecialEvent } from "@/lib/revalidate-special-events";
import {
  formatZodErrors,
  specialEventTocUpdateSchema,
} from "@/lib/validators";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, context: RouteContext) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validation = specialEventTocUpdateSchema.safeParse(payload);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Validation failed.", details: formatZodErrors(validation.error) },
      { status: 422 },
    );
  }

  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  const data = validation.data;
  const override =
    data.specialEventTocMode === "CUSTOM"
      ? parseSpecialEventTocOverride(data.specialEventTocOverride)
      : null;

  const updated = await prisma.event.update({
    where: { id },
    data: {
      isSpecialEvent: true,
      specialEventTocMode: data.specialEventTocMode,
      specialEventTocOverride:
        override === null
          ? Prisma.JsonNull
          : (override as Prisma.InputJsonValue),
    },
  });

  revalidateSpecialEvent(updated.slug);

  return NextResponse.json(updated);
}
