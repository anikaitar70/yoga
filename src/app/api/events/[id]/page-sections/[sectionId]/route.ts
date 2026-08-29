import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin-session";
import { parseSectionPayload } from "@/lib/page-section-payloads";
import { parseSectionLayout } from "@/lib/section-layout";
import {
  sanitizeCustomTextPayload,
  sanitizeDynamicImageTextPayload,
  sanitizeRichTextHtml,
} from "@/lib/rich-text-server";
import { revalidateSpecialEvent } from "@/lib/revalidate-special-events";
import { ZodError } from "zod";
import {
  eventPageSectionUpdateSchema,
  formatZodErrors,
} from "@/lib/validators";
import { compactEventPageSectionJaLocale } from "@/lib/event-page-section-locale";

interface RouteContext {
  params: Promise<{ id: string; sectionId: string }>;
}

export async function PUT(request: Request, context: RouteContext) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const { id, sectionId } = await context.params;
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validation = eventPageSectionUpdateSchema.safeParse(payload);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Validation failed.", details: formatZodErrors(validation.error) },
      { status: 422 },
    );
  }

  const existing = await prisma.eventPageSection.findFirst({
    where: { id: sectionId, eventId: id },
    include: { event: { select: { slug: true } } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Section not found." }, { status: 404 });
  }

  const data = validation.data;
  const sectionType = data.sectionType ?? existing.sectionType;
  let parsedPayload: Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined = existing.payload ?? undefined;

  if (data.payload !== undefined) {
    if (data.payload === null) {
      parsedPayload = Prisma.JsonNull;
    } else {
      try {
        parsedPayload = parseSectionPayload(sectionType, data.payload, "ABOUT") as Prisma.InputJsonValue;
        if (sectionType === "CUSTOM_TEXT") {
          parsedPayload = sanitizeCustomTextPayload(parsedPayload) as Prisma.InputJsonValue;
        }
        if (sectionType === "DYNAMIC_IMAGE_TEXT" || sectionType === "IMAGE_TEXT") {
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
    }
  }

  const updateData: Prisma.EventPageSectionUpdateInput = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.subtitle !== undefined) updateData.subtitle = data.subtitle;
  if (data.content !== undefined) {
    updateData.content = data.content ? sanitizeRichTextHtml(data.content) : data.content;
  }
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
  if (data.imageAlt !== undefined) updateData.imageAlt = data.imageAlt;
  if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
  if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;
  if (data.sectionType !== undefined) updateData.sectionType = data.sectionType;
  if (data.payload !== undefined) updateData.payload = parsedPayload;
  if (data.layout !== undefined) {
    updateData.layout =
      data.layout === null ? Prisma.JsonNull : (parseSectionLayout(data.layout) as Prisma.InputJsonValue);
  }
  if (data.jaLocale !== undefined) {
    const compact = compactEventPageSectionJaLocale((data.jaLocale as never) ?? {});
    updateData.jaLocale = compact ? (compact as Prisma.InputJsonValue) : Prisma.JsonNull;
  }

  const section = await prisma.eventPageSection.update({
    where: { id: sectionId },
    data: updateData,
  });

  if (existing.isPublished || data.isPublished) {
    revalidateSpecialEvent(existing.event.slug);
  }

  return NextResponse.json(section);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const { id, sectionId } = await context.params;
  const existing = await prisma.eventPageSection.findFirst({
    where: { id: sectionId, eventId: id },
    include: { event: { select: { slug: true } } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Section not found." }, { status: 404 });
  }

  await prisma.eventPageSection.delete({ where: { id: sectionId } });
  revalidateSpecialEvent(existing.event.slug);

  return new Response(null, { status: 204 });
}
