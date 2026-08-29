import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin-session";
import { PAGE_TYPES } from "@/lib/page-section-types";

const scopeSchema = z.enum(["homepage", "program", "specialEvent"]);

const getQuerySchema = z.object({
  scope: scopeSchema,
  pageType: z.enum(PAGE_TYPES as unknown as [string, ...string[]]).optional(),
  eventId: z.string().uuid().optional(),
});

const putBodySchema = z.object({
  orderedIds: z.array(z.string().uuid()).max(50),
});

function validateScopeParams(scope: string, pageType?: string, eventId?: string) {
  if (scope === "program" && !pageType) {
    return "pageType is required for program scope";
  }
  if (scope === "specialEvent" && !eventId) {
    return "eventId is required for specialEvent scope";
  }
  return null;
}

export async function GET(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope") ?? "";
  const pageType = searchParams.get("pageType") ?? undefined;
  const eventId = searchParams.get("eventId") ?? undefined;

  const parsed = getQuerySchema.safeParse({ scope, pageType, eventId });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters", details: parsed.error.issues }, { status: 400 });
  }

  const err = validateScopeParams(scope, pageType, eventId);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  try {
    let selections: { testimonialId: string; sortOrder: number }[] = [];
    if (scope === "homepage") {
      selections = await prisma.homepageTestimonial.findMany({
        orderBy: { sortOrder: "asc" },
        select: { testimonialId: true, sortOrder: true },
      });
    } else if (scope === "program") {
      selections = await prisma.programPageTestimonial.findMany({
        where: { pageType: pageType as never },
        orderBy: { sortOrder: "asc" },
        select: { testimonialId: true, sortOrder: true },
      });
    } else if (scope === "specialEvent") {
      selections = await prisma.specialEventTestimonial.findMany({
        where: { eventId: eventId! },
        orderBy: { sortOrder: "asc" },
        select: { testimonialId: true, sortOrder: true },
      });
    }

    return NextResponse.json({ selections, orderedIds: selections.map((s) => s.testimonialId) });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("does not exist") || message.includes("not exist")) {
      return NextResponse.json({ selections: [], orderedIds: [] });
    }
    return NextResponse.json({ error: "Unable to fetch selections" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope") ?? "";
  const pageType = searchParams.get("pageType") ?? undefined;
  const eventId = searchParams.get("eventId") ?? undefined;

  const queryParsed = getQuerySchema.safeParse({ scope, pageType, eventId });
  if (!queryParsed.success) {
    return NextResponse.json({ error: "Invalid query parameters", details: queryParsed.error.issues }, { status: 400 });
  }

  const err = validateScopeParams(scope, pageType, eventId);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const bodyParsed = putBodySchema.safeParse(body);
  if (!bodyParsed.success) {
    return NextResponse.json({ error: "Validation failed", details: bodyParsed.error.issues }, { status: 422 });
  }

  const orderedIds = [...new Set(bodyParsed.data.orderedIds)];

  // Validate all testimonial IDs exist
  if (orderedIds.length > 0) {
    const existing = await prisma.testimonial.findMany({
      where: { id: { in: orderedIds } },
      select: { id: true },
    });
    const existingIds = new Set(existing.map((t) => t.id));
    const missing = orderedIds.filter((id) => !existingIds.has(id));
    if (missing.length > 0) {
      return NextResponse.json({ error: `Testimonials not found: ${missing.join(", ")}` }, { status: 400 });
    }
  }

  // Validate specialEvent exists
  if (scope === "specialEvent" && eventId) {
    const event = await prisma.event.findUnique({ where: { id: eventId }, select: { id: true } });
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      if (scope === "homepage") {
        await tx.homepageTestimonial.deleteMany({});
        if (orderedIds.length > 0) {
          await tx.homepageTestimonial.createMany({
            data: orderedIds.map((testimonialId, index) => ({
              testimonialId,
              sortOrder: index,
            })),
          });
        }
      } else if (scope === "program") {
        await tx.programPageTestimonial.deleteMany({ where: { pageType: pageType as never } });
        if (orderedIds.length > 0) {
          await tx.programPageTestimonial.createMany({
            data: orderedIds.map((testimonialId, index) => ({
              pageType: pageType as never,
              testimonialId,
              sortOrder: index,
            })),
          });
        }
      } else if (scope === "specialEvent") {
        await tx.specialEventTestimonial.deleteMany({ where: { eventId: eventId! } });
        if (orderedIds.length > 0) {
          await tx.specialEventTestimonial.createMany({
            data: orderedIds.map((testimonialId, index) => ({
              eventId: eventId!,
              testimonialId,
              sortOrder: index,
            })),
          });
        }
      }
    });

    // Revalidation
    const { revalidateTag, revalidatePath } = await import("next/cache");
    const { LOCALES } = await import("@/lib/i18n/locale");
    const { localizedPath } = await import("@/lib/i18n/paths");

    if (scope === "homepage") {
      revalidateTag("testimonials", "max");
      for (const locale of LOCALES) {
        revalidatePath(localizedPath("/", locale), "page");
        revalidatePath(localizedPath("/testimonials", locale), "page");
      }
      revalidatePath("/", "page");
      revalidatePath("/testimonials", "page");
    } else if (scope === "program") {
      const pathMap: Record<string, string> = {
        YOGA: "/yoga",
        HEALING: "/healing",
        JUST_ART_LIFE: "/just-art-life",
        ABOUT: "/about",
      };
      const path = pathMap[pageType!];
      if (path) {
        for (const locale of LOCALES) {
          revalidatePath(localizedPath(path, locale), "page");
        }
        revalidatePath(path, "page");
      }
    } else if (scope === "specialEvent" && eventId) {
      const event = await prisma.event.findUnique({ where: { id: eventId }, select: { slug: true } });
      if (event) {
        const { specialEventPublicPath } = await import("@/lib/event-page-section");
        const path = specialEventPublicPath(event.slug);
        for (const locale of LOCALES) {
          revalidatePath(localizedPath(path, locale), "page");
        }
        revalidatePath(path, "page");
      }
    }

    return NextResponse.json({ ok: true, orderedIds });
  } catch (error) {
    return NextResponse.json({ error: "Unable to save selections" }, { status: 500 });
  }
}
