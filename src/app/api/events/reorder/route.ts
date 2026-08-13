import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin-session";
import { revalidateCmsContentPaths } from "@/lib/revalidate-branding";
import { revalidateEvents } from "@/lib/revalidate-events";
import { DEFAULT_EVENT_ORDER } from "@/lib/event-map";
import { eventReorderSchema, formatZodErrors } from "@/lib/validators";
import { badRequest, serverError, jsonResponse } from "@/lib/api";

export async function PATCH(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badRequest("Invalid JSON request body.");
  }

  const validation = eventReorderSchema.safeParse(payload);
  if (!validation.success) {
    return badRequest(formatZodErrors(validation.error));
  }

  const { orderedIds } = validation.data;

  try {
    const existing = await prisma.event.findMany({ select: { id: true } });
    const existingIds = new Set(existing.map((event) => event.id));
    if (orderedIds.length !== existing.length) {
      return badRequest("Reorder payload must include every event.");
    }
    for (const id of orderedIds) {
      if (!existingIds.has(id)) {
        return badRequest("Reorder payload contains unknown event ids.");
      }
    }

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.event.update({
          where: { id },
          data: { sortOrder: index },
        }),
      ),
    );

    const events = await prisma.event.findMany({ orderBy: DEFAULT_EVENT_ORDER });
    revalidateEvents();
    revalidateCmsContentPaths();
    return jsonResponse(events);
  } catch {
    return serverError("Unable to reorder events.");
  }
}
