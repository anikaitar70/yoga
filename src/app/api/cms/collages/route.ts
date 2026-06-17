import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin-session";
import { collageCreateSchema, formatZodErrors } from "@/lib/validators";

export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const collages = await prisma.galleryCollage.findMany({
    orderBy: { name: "asc" },
    include: { collection: { select: { slug: true, title: true } } },
  });

  return NextResponse.json(collages);
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

  const validation = collageCreateSchema.safeParse(payload);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Validation failed.", details: formatZodErrors(validation.error) },
      { status: 422 },
    );
  }

  const collage = await prisma.galleryCollage.create({
    data: {
      ...validation.data,
      imageIds: validation.data.imageIds,
    },
  });

  return NextResponse.json(collage, { status: 201 });
}
