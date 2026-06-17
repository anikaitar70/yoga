import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin-session";
import { eventCreateSchema, formatZodErrors } from "@/lib/validators";
import { badRequest, serverError, jsonResponse } from "@/lib/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeUnpublished = searchParams.get("admin") === "1";
  const unauthorized = includeUnpublished ? await requireAdminSession() : null;
  if (unauthorized) return unauthorized;

  try {
    const events = await prisma.event.findMany({
      where: includeUnpublished ? undefined : { published: true },
      orderBy: { startsAt: "asc" },
    });
    return jsonResponse(events);
  } catch {
    return serverError("Unable to fetch events.");
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return badRequest("Invalid JSON request body.");
  }

  const validation = eventCreateSchema.safeParse(payload);
  if (!validation.success) {
    return badRequest(formatZodErrors(validation.error));
  }

  try {
    const event = await prisma.event.create({
      data: {
        title: validation.data.title,
        slug: validation.data.slug,
        description: validation.data.description,
        location: validation.data.location,
        startsAt: new Date(validation.data.startsAt),
        endsAt: validation.data.endsAt ? new Date(validation.data.endsAt) : undefined,
        imageUrl: validation.data.imageUrl,
        price: validation.data.price,
        category: validation.data.category,
        isFeatured: validation.data.isFeatured,
        published: validation.data.published,
      },
    });
    return NextResponse.json(event, { status: 201 });
  } catch {
    return serverError("Unable to create event.");
  }
}
