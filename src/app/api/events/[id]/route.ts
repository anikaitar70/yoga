import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin-session";
import { revalidateCmsContentPaths } from "@/lib/revalidate-branding";
import { revalidateEvents } from "@/lib/revalidate-events";
import { revalidateSpecialEvent } from "@/lib/revalidate-special-events";
import { eventUpdateSchema, formatZodErrors } from "@/lib/validators";
import { sanitizeEventDetailForSave, parseEventDetail } from "@/lib/event-detail";
import { sanitizeRichTextHtml } from "@/lib/rich-text-server";
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
    if (!event || !event.published) {
      return notFound("Event not found.");
    }
    return jsonResponse(event);
  } catch {
    return serverError("Unable to fetch event.");
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

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
    const data = validation.data;
    const updateData: Prisma.EventUpdateInput = {};

    if (data.startsAt !== undefined) {
      updateData.startsAt = new Date(data.startsAt);
    }
    if (data.endsAt !== undefined) {
      updateData.endsAt = data.endsAt ? new Date(data.endsAt) : null;
    }
    if (data.category !== undefined) updateData.category = data.category;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = sanitizeRichTextHtml(data.description);
    if (data.location !== undefined) updateData.location = data.location;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.imageAlt !== undefined) updateData.imageAlt = data.imageAlt;
    if (data.externalUrl !== undefined) updateData.externalUrl = data.externalUrl;
    if (data.externalLinkLabel !== undefined) {
      updateData.externalLinkLabel = data.externalLinkLabel?.trim() || null;
    }
    if (data.specialEventCtaLabel !== undefined) {
      updateData.specialEventCtaLabel = data.specialEventCtaLabel?.trim() || null;
    }
    if (data.specialEventCtaUrl !== undefined) {
      updateData.specialEventCtaUrl = data.specialEventCtaUrl?.trim() || null;
    }
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.eventDetail !== undefined) {
      const sanitized = sanitizeEventDetailForSave(parseEventDetail(data.eventDetail));
      updateData.eventDetail = sanitized === null ? Prisma.DbNull : (sanitized as Prisma.InputJsonValue);
    }
    if (data.price !== undefined) updateData.price = data.price;
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
    if (data.published !== undefined) updateData.published = data.published;
    if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle;
    if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription;
    if (data.ogImageUrl !== undefined) updateData.ogImageUrl = data.ogImageUrl;
    if (data.canonicalUrlOverride !== undefined) {
      updateData.canonicalUrlOverride = data.canonicalUrlOverride || null;
    }
    if (data.focusKeywords !== undefined) updateData.focusKeywords = data.focusKeywords;
    if (data.jaTranslationStatus !== undefined) {
      updateData.jaTranslationStatus = data.jaTranslationStatus;
    }
    if (data.isSpecialEvent !== undefined) updateData.isSpecialEvent = data.isSpecialEvent;
    if (data.specialEventTocMode !== undefined) {
      updateData.specialEventTocMode = data.specialEventTocMode;
    }
    if (data.specialEventTocOverride !== undefined) {
      updateData.specialEventTocOverride =
        data.specialEventTocOverride === null
          ? Prisma.JsonNull
          : (data.specialEventTocOverride as Prisma.InputJsonValue);
    }
    if (data.jaLocale !== undefined) {
      if (data.jaLocale === null || Object.keys(data.jaLocale).length === 0) {
        updateData.jaLocale = Prisma.JsonNull;
      } else {
        const sanitizedJaLocale: Record<string, unknown> = { ...(data.jaLocale as Record<string, unknown>) };
        if (typeof sanitizedJaLocale.description === "string") {
          sanitizedJaLocale.description = sanitizeRichTextHtml(sanitizedJaLocale.description as string);
        }
        updateData.jaLocale = sanitizedJaLocale as Prisma.InputJsonValue;
      }
    }

    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      return notFound("Event not found.");
    }

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
    });
    revalidateEvents({ specialEventSlug: event.isSpecialEvent ? event.slug : undefined });
    revalidateCmsContentPaths();
    if (event.isSpecialEvent) {
      revalidateSpecialEvent(event.slug);
    }
    return jsonResponse(event);
  } catch {
    return serverError("Unable to update event.");
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;

  try {
    await prisma.event.delete({ where: { id } });
    revalidateEvents();
    revalidateCmsContentPaths();
    return new Response(null, { status: 204 });
  } catch {
    return notFound("Event not found.");
  }
}
