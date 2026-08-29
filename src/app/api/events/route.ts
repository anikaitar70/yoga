import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordCmsSaveFailure } from "@/lib/app-diagnostics";
import { requireAdminSession } from "@/lib/require-admin-session";
import { revalidateCmsContentPaths } from "@/lib/revalidate-branding";
import { revalidateEvents } from "@/lib/revalidate-events";
import { eventCreateSchema, formatZodErrors } from "@/lib/validators";
import { sanitizeEventDetailForSave, parseEventDetail } from "@/lib/event-detail";
import { sanitizeRichTextHtml } from "@/lib/rich-text-server";
import { badRequest, serverError, jsonResponse } from "@/lib/api";
import type { Prisma } from "@prisma/client";
import { DEFAULT_EVENT_ORDER } from "@/lib/event-map";

function buildEventCreateData(
  data: ReturnType<typeof eventCreateSchema.parse>,
): Prisma.EventCreateInput {
  const eventDetail = sanitizeEventDetailForSave(parseEventDetail(data.eventDetail ?? null));
  const description = sanitizeRichTextHtml(data.description);
  const jaLocale = data.jaLocale
    ? {
        ...data.jaLocale,
        ...(data.jaLocale.description ? { description: sanitizeRichTextHtml(data.jaLocale.description) } : {}),
      }
    : undefined;

  return {
    title: data.title,
    slug: data.slug,
    description,
    location: data.location,
    startsAt: new Date(data.startsAt),
    endsAt: data.endsAt ? new Date(data.endsAt) : null,
    imageUrl: data.imageUrl ?? null,
    imageAlt: data.imageAlt,
    externalUrl: data.externalUrl ?? null,
    externalLinkLabel: data.externalLinkLabel?.trim() || null,
    specialEventCtaLabel: data.specialEventCtaLabel?.trim() || null,
    specialEventCtaUrl: data.specialEventCtaUrl?.trim() || null,
    eventDetail: eventDetail === null ? undefined : (eventDetail as Prisma.InputJsonValue),
    sortOrder: data.sortOrder,
    price: data.price ?? null,
    category: data.category,
    isFeatured: data.isFeatured,
    published: data.published,
    seoTitle: data.seoTitle,
    metaDescription: data.metaDescription,
    ogImageUrl: data.ogImageUrl,
    canonicalUrlOverride: data.canonicalUrlOverride || null,
    focusKeywords: data.focusKeywords,
    jaTranslationStatus: data.jaTranslationStatus,
    jaLocale: jaLocale as Prisma.InputJsonValue | undefined,
    isSpecialEvent: data.isSpecialEvent,
    specialEventTocMode: data.specialEventTocMode,
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
      orderBy: DEFAULT_EVENT_ORDER,
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
    const maxSort = await prisma.event.aggregate({ _max: { sortOrder: true } });
    const event = await prisma.event.create({
      data: {
        ...buildEventCreateData(validation.data),
        sortOrder: validation.data.sortOrder ?? (maxSort._max.sortOrder ?? -1) + 1,
      },
    });
    revalidateEvents();
    revalidateCmsContentPaths();
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    recordCmsSaveFailure("event", error);
    return serverError("Unable to create event.");
  }
}
