import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordCmsSaveFailure } from "@/lib/app-diagnostics";
import { requireAdminSession } from "@/lib/require-admin-session";
import { parseSectionPayload } from "@/lib/page-section-payloads";
import { parseSectionLayout } from "@/lib/section-layout";
import { revalidateProgramPage } from "@/lib/revalidate-program-pages";
import { ZodError } from "zod";
import { formatZodErrors, pageSectionUpdateSchema } from "@/lib/validators";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function summarizeTestimonialPayload(payload: unknown) {
  const items =
    typeof payload === "object" &&
    payload !== null &&
    "items" in payload &&
    Array.isArray((payload as { items?: unknown }).items)
      ? (payload as { items: unknown[] }).items
      : [];

  return {
    itemCount: items.length,
    items: items.map((item, index) => {
      const record = typeof item === "object" && item !== null ? (item as Record<string, unknown>) : {};
      return {
        index,
        hasQuote: typeof record.quote === "string" && record.quote.trim().length > 0,
        quoteLength: typeof record.quote === "string" ? record.quote.trim().length : 0,
        hasName: typeof record.name === "string" && record.name.trim().length > 0,
        hasRole: typeof record.role === "string" && record.role.trim().length > 0,
        hasImageUrl: typeof record.imageUrl === "string" && record.imageUrl.trim().length > 0,
        imageUrlValue:
          typeof record.imageUrl === "string"
            ? record.imageUrl.trim()
              ? "[present]"
              : "[blank-string]"
            : "[missing]",
      };
    }),
  };
}

export async function PUT(request: Request, context: RouteContext) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validation = pageSectionUpdateSchema.safeParse(payload);
  if (!validation.success) {
    console.warn("[testimonial-save:api:validation-failed]", {
      id,
      details: formatZodErrors(validation.error),
      payload: summarizeTestimonialPayload(
        typeof payload === "object" && payload !== null ? (payload as { payload?: unknown }).payload : undefined,
      ),
    });
    return NextResponse.json(
      { error: "Validation failed.", details: formatZodErrors(validation.error) },
      { status: 422 },
    );
  }

  const existing = await prisma.pageSection.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Section not found." }, { status: 404 });
  }

  const data = validation.data;
  const sectionType = data.sectionType ?? existing.sectionType;
  if (sectionType === "TESTIMONIALS") {
    console.info("[testimonial-save:api:received]", {
      id,
      existingType: existing.sectionType,
      requestedType: data.sectionType ?? null,
      hasPayload: data.payload !== undefined,
      incoming: summarizeTestimonialPayload(data.payload),
    });
  }
  let parsedPayload: Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined = existing.payload ?? undefined;

  if (data.payload !== undefined) {
    if (data.payload === null) {
      parsedPayload = Prisma.JsonNull;
    } else {
      try {
        parsedPayload = parseSectionPayload(
          sectionType,
          data.payload,
          existing.pageType,
        ) as Prisma.InputJsonValue;
        if (sectionType === "TESTIMONIALS") {
          console.info("[testimonial-save:api:parsed]", {
            id,
            parsed: summarizeTestimonialPayload(parsedPayload),
          });
        }
      } catch (error) {
        console.error("[testimonial-save:api:parse-error]", {
          id,
          sectionType,
          error: error instanceof Error ? error.message : String(error),
          incoming: summarizeTestimonialPayload(data.payload),
        });
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

  const updateData: Prisma.PageSectionUpdateInput = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.subtitle !== undefined) updateData.subtitle = data.subtitle;
  if (data.content !== undefined) updateData.content = data.content;
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

  try {
    const section = await prisma.pageSection.update({
      where: { id },
      data: updateData,
    });
    if (section.sectionType === "TESTIMONIALS") {
      console.info("[testimonial-save:api:updated]", {
        id,
        published: section.isPublished,
        saved: summarizeTestimonialPayload(section.payload),
      });
    }

    if (existing.isPublished || data.isPublished) {
      revalidateProgramPage(existing.pageType);
    }

    return NextResponse.json(section);
  } catch (error) {
    recordCmsSaveFailure("page section", error);
    return NextResponse.json({ error: "Unable to save page section." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const existing = await prisma.pageSection.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Section not found." }, { status: 404 });
  }

  await prisma.pageSection.delete({ where: { id } });
  revalidateProgramPage(existing.pageType);

  return new Response(null, { status: 204 });
}
