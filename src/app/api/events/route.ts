import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordCmsSaveFailure } from "@/lib/app-diagnostics";
import { requireAdminSession } from "@/lib/require-admin-session";
import { revalidateCmsContentPaths } from "@/lib/revalidate-branding";
import { eventCreateSchema, formatZodErrors } from "@/lib/validators";
import { sanitizeEventDetailForSave } from "@/lib/event-detail";
import { badRequest, serverError, jsonResponse } from "@/lib/api";
import type { Prisma } from "@prisma/client";

function buildEventCreateData(
  data: ReturnType<typeof eventCreateSchema.parse>,
): Prisma.EventCreateInput {
  const eventDetail = sanitizeEventDetailForSave(data.eventDetail ?? null);

  return {
    title: data.title,
    slug: data.slug,
    description: data.description,
    location: data.location,
    startsAt: new Date(data.startsAt),
    endsAt: data.endsAt ? new Date(data.endsAt) : null,
    imageUrl: data.imageUrl ?? null,
    imageAlt: data.imageAlt,
    externalUrl: data.externalUrl ?? null,
    eventDetail: eventDetail === null ? undefined : (eventDetail as Prisma.InputJsonValue),
    price: data.price,
    category: data.category,
    isFeatured: data.isFeatured,
    published: data.published,
    seoTitle: data.seoTitle,
    metaDescription: data.metaDescription,
    ogImageUrl: data.ogImageUrl,
    canonicalUrlOverride: data.canonicalUrlOverride || null,
    focusKeywords: data.focusKeywords,
    jaTranslationStatus: data.jaTranslationStatus,
  };
}

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
      data: buildEventCreateData(validation.data),
    });
    revalidateCmsContentPaths();
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    recordCmsSaveFailure("event", error);
    return serverError("Unable to create event.");
  }
}
