import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin-session";
import {
  defaultPayloadForSectionType,
  parseSectionPayload,
} from "@/lib/page-section-payloads";
import { parseSectionLayout } from "@/lib/section-layout";
import {
  sanitizeCustomTextPayload,
  sanitizeDynamicImageTextPayload,
  sanitizeRichTextHtml,
} from "@/lib/rich-text-server";
import { generateAnchorSlug } from "@/lib/event-page-section";
import { revalidateSpecialEvent } from "@/lib/revalidate-special-events";
import { ZodError } from "zod";
import {
  eventPageSectionCreateSchema,
  formatZodErrors,
} from "@/lib/validators";
import { compactEventPageSectionJaLocale } from "@/lib/event-page-section-locale";

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function getEventOr404(eventId: string) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return null;
  return event;
}

export async function GET(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const event = await getEventOr404(id);
  if (!event) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  const sections = await prisma.eventPageSection.findMany({
    where: { eventId: id },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(sections);
}

export async function POST(request: Request, context: RouteContext) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const event = await getEventOr404(id);
  if (!event) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validation = eventPageSectionCreateSchema.safeParse(payload);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Validation failed.", details: formatZodErrors(validation.error) },
      { status: 422 },
    );
  }

  const data = validation.data;
  let parsedPayload: Prisma.InputJsonValue | undefined;

  if (data.payload != null) {
    try {
      parsedPayload = parseSectionPayload(data.sectionType, data.payload, "ABOUT") as Prisma.InputJsonValue;
      if (data.sectionType === "CUSTOM_TEXT") {
        parsedPayload = sanitizeCustomTextPayload(parsedPayload) as Prisma.InputJsonValue;
      }
      if (data.sectionType === "DYNAMIC_IMAGE_TEXT" || data.sectionType === "IMAGE_TEXT") {
        parsedPayload = sanitizeDynamicImageTextPayload(parsedPayload) as Prisma.InputJsonValue;
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: "Invalid section payload.", details: formatZodErrors(error) },
          { status: 422 },
        );
      }
      return NextResponse.json({ error: "Invalid section payload." }, { status: 422 });
    }
  } else {
    const defaults = defaultPayloadForSectionType(data.sectionType, "ABOUT");
    parsedPayload = defaults ? (defaults as Prisma.InputJsonValue) : undefined;
  }

  const existingAnchors = await prisma.eventPageSection.findMany({
    where: { eventId: id },
    select: { anchorSlug: true },
  });
  const anchorSlug =
    data.anchorSlug?.trim() ||
    generateAnchorSlug(
      data.title,
      existingAnchors.map((section) => section.anchorSlug),
    );

  const maxOrder = await prisma.eventPageSection.aggregate({
    where: { eventId: id },
    _max: { sortOrder: true },
  });

  const section = await prisma.eventPageSection.create({
    data: {
      eventId: id,
      sectionType: data.sectionType,
      anchorSlug,
      title: data.title,
      subtitle: data.subtitle,
      content: data.content ? sanitizeRichTextHtml(data.content) : data.content,
      imageUrl: data.imageUrl,
      imageAlt: data.imageAlt,
      sortOrder: data.sortOrder ?? (maxOrder._max.sortOrder ?? -1) + 1,
      isPublished: data.isPublished ?? false,
      layout: data.layout ? (parseSectionLayout(data.layout) as Prisma.InputJsonValue) : undefined,
      payload: parsedPayload ?? undefined,
      jaLocale: compactEventPageSectionJaLocale((data.jaLocale as never) ?? {})
        ? (compactEventPageSectionJaLocale((data.jaLocale as never) ?? {}) as Prisma.InputJsonValue)
        : undefined,
    },
  });

  await prisma.event.update({
    where: { id },
    data: { isSpecialEvent: true },
  });

  if (section.isPublished) {
    revalidateSpecialEvent(event.slug);
  }

  return NextResponse.json(section, { status: 201 });
}
