import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { eventCreateSchema, formatZodErrors } from "@/lib/validators";
import { badRequest, serverError, jsonResponse } from "@/lib/api";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { startsAt: "asc" },
    });
    return jsonResponse(events);
  } catch (error) {
    return serverError("Unable to fetch events.");
  }
}

export async function POST(request: Request) {
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
    const categoryMap: Record<string, string> = {
      yoga: "YOGA",
      healing: "HEALING",
      "just-art-life": "JUST_ART_LIFE",
      "retreats-and-tours": "RETREATS_AND_TOURS",
    };

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
        category: (categoryMap[validation.data.category as string] || "YOGA") as any,
        isFeatured: validation.data.isFeatured,
        published: validation.data.published,
      },
    });
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    return serverError("Unable to create event.");
  }
}
