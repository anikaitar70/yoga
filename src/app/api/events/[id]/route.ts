import { prisma } from "@/lib/prisma";
import { eventUpdateSchema, formatZodErrors } from "@/lib/validators";
import { badRequest, notFound, serverError, jsonResponse } from "@/lib/api";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      return notFound("Event not found.");
    }
    return jsonResponse(event);
  } catch (error) {
    return serverError("Unable to fetch event.");
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return badRequest("Invalid JSON request body.");
  }

  const validation = eventUpdateSchema.safeParse(payload);
  if (!validation.success) {
    return badRequest(formatZodErrors(validation.error));
  }

  try {
    const categoryMap: Record<string, string> = {
      yoga: "YOGA",
      healing: "HEALING",
      "just-art-life": "JUST_ART_LIFE",
      "retreats-and-tours": "RETREATS_AND_TOURS",
    };

    const updateData: any = {
      startsAt: validation.data.startsAt ? new Date(validation.data.startsAt) : undefined,
      endsAt: validation.data.endsAt ? new Date(validation.data.endsAt) : undefined,
    };

    if (validation.data.category) {
      updateData.category = categoryMap[validation.data.category as string] || "YOGA";
    }

    // Copy over other fields
    if (validation.data.title !== undefined) updateData.title = validation.data.title;
    if (validation.data.slug !== undefined) updateData.slug = validation.data.slug;
    if (validation.data.description !== undefined) updateData.description = validation.data.description;
    if (validation.data.location !== undefined) updateData.location = validation.data.location;
    if (validation.data.imageUrl !== undefined) updateData.imageUrl = validation.data.imageUrl;
    if (validation.data.price !== undefined) updateData.price = validation.data.price;
    if (validation.data.isFeatured !== undefined) updateData.isFeatured = validation.data.isFeatured;
    if (validation.data.published !== undefined) updateData.published = validation.data.published;

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
    });
    return jsonResponse(event);
  } catch (error) {
    return serverError("Unable to update event.");
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    await prisma.event.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch (error) {
    return notFound("Event not found.");
  }
}
