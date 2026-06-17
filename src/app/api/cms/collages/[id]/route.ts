import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin-session";
import { collageUpdateSchema, formatZodErrors } from "@/lib/validators";

interface RouteContext {
  params: Promise<{ id: string }>;
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

  const validation = collageUpdateSchema.safeParse(payload);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Validation failed.", details: formatZodErrors(validation.error) },
      { status: 422 },
    );
  }

  const collage = await prisma.galleryCollage.update({
    where: { id },
    data: {
      ...validation.data,
      ...(validation.data.imageIds ? { imageIds: validation.data.imageIds } : {}),
    },
  });

  return NextResponse.json(collage);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  await prisma.galleryCollage.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
