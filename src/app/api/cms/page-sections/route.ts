import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin-session";
import {
  defaultPayloadForSectionType,
  parseSectionPayload,
} from "@/lib/page-section-payloads";
import type { PageType } from "@/lib/page-section-types";
import { PAGE_TYPES } from "@/lib/page-section-types";
import { parseSectionLayout } from "@/lib/section-layout";
import { revalidateProgramPage } from "@/lib/revalidate-program-pages";
import { ZodError } from "zod";
import {
  formatZodErrors,
  pageSectionCreateSchema,
} from "@/lib/validators";

function isPageType(value: string | null): value is PageType {
  return value != null && (PAGE_TYPES as readonly string[]).includes(value);
}

export async function GET(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const pageType = searchParams.get("pageType");

  if (!isPageType(pageType)) {
    return NextResponse.json(
      { error: "Query parameter pageType is required (YOGA, HEALING, JUST_ART_LIFE, ABOUT)." },
      { status: 400 },
    );
  }

  const sections = await prisma.pageSection.findMany({
    where: { pageType },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(sections);
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validation = pageSectionCreateSchema.safeParse(payload);
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
      parsedPayload = parseSectionPayload(
        data.sectionType,
        data.payload,
        data.pageType,
      ) as Prisma.InputJsonValue;
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
    const defaults = defaultPayloadForSectionType(data.sectionType, data.pageType);
    parsedPayload = defaults ? (defaults as Prisma.InputJsonValue) : undefined;
  }

  const maxOrder = await prisma.pageSection.aggregate({
    where: { pageType: data.pageType },
    _max: { sortOrder: true },
  });

  const section = await prisma.pageSection.create({
    data: {
      pageType: data.pageType,
      sectionType: data.sectionType,
      title: data.title,
      subtitle: data.subtitle,
      content: data.content,
      imageUrl: data.imageUrl,
      imageAlt: data.imageAlt,
      sortOrder: data.sortOrder ?? (maxOrder._max.sortOrder ?? -1) + 1,
      isPublished: data.isPublished ?? false,
      layout: data.layout ? (parseSectionLayout(data.layout) as Prisma.InputJsonValue) : undefined,
      payload: parsedPayload ?? undefined,
    },
  });

  if (section.isPublished) {
    revalidateProgramPage(data.pageType);
  }

  return NextResponse.json(section, { status: 201 });
}
