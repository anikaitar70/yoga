import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin-session";
import { revalidateSpecialEvent } from "@/lib/revalidate-special-events";
import {
  eventPageSectionReorderSchema,
  formatZodErrors,
} from "@/lib/validators";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validation = eventPageSectionReorderSchema.safeParse(payload);
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

  const { orderedIds } = validation.data;

  await prisma.$transaction(
    orderedIds.map((sectionId, index) =>
      prisma.eventPageSection.updateMany({
        where: { id: sectionId, eventId: id },
        data: { sortOrder: index },
      }),
    ),
  );

  const sections = await prisma.eventPageSection.findMany({
    where: { eventId: id },
    orderBy: { sortOrder: "asc" },
  });

  revalidateSpecialEvent(event.slug);

  return NextResponse.json(sections);
}
