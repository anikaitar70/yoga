import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordCmsSaveFailure } from "@/lib/app-diagnostics";
import { requireAdminSession } from "@/lib/require-admin-session";
import { revalidateCmsContentPaths } from "@/lib/revalidate-branding";
import {
  galleryBatchCreateSchema,
  galleryCreateSchema,
  galleryReorderSchema,
  formatZodErrors,
} from "@/lib/validators";

export async function GET(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const collectionId = searchParams.get("collectionId");
  const category = searchParams.get("category");

  const gallery = await prisma.galleryImage.findMany({
    where: {
      ...(collectionId ? { collectionId } : {}),
      ...(category ? { category: category as never } : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: { collection: { select: { slug: true, title: true } } },
  });

  return NextResponse.json(gallery);
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

  const batchValidation = galleryBatchCreateSchema.safeParse(payload);
  if (batchValidation.success) {
    try {
      const { collectionId, category, items } = batchValidation.data;
      const created = await prisma.$transaction(
        items.map((item, index) =>
          prisma.galleryImage.create({
            data: {
              url: item.url,
              thumbnailUrl: item.thumbnailUrl,
              mediumUrl: item.mediumUrl,
              width: item.width,
              height: item.height,
              uploadPath: item.uploadPath ?? item.url,
              title: item.title,
              altText: item.altText,
              description: item.description,
              category,
              collectionId,
              sortOrder: item.sortOrder ?? index,
              featuredOnHomepage: item.featuredOnHomepage ?? false,
              isPublished: true,
            },
          }),
        ),
      );
      revalidateCmsContentPaths();
      return NextResponse.json(created, { status: 201 });
    } catch (error) {
      recordCmsSaveFailure("gallery images", error);
      return NextResponse.json({ error: "Unable to save gallery images." }, { status: 500 });
    }
  }

  const validation = galleryCreateSchema.safeParse(payload);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Validation failed.", details: formatZodErrors(validation.error) },
      { status: 422 },
    );
  }

  const data = validation.data;
  try {
    const gallery = await prisma.galleryImage.create({
      data: {
        ...data,
        uploadPath: data.uploadPath ?? data.url,
      },
    });
    revalidateCmsContentPaths();
    return NextResponse.json(gallery, { status: 201 });
  } catch (error) {
    recordCmsSaveFailure("gallery image", error);
    return NextResponse.json({ error: "Unable to save gallery image." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validation = galleryReorderSchema.safeParse(payload);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Validation failed.", details: formatZodErrors(validation.error) },
      { status: 422 },
    );
  }

  const { orderedIds } = validation.data;
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.galleryImage.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );

  revalidateCmsContentPaths();
  return NextResponse.json({ ok: true });
}
