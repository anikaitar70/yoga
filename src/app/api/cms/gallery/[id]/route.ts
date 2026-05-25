import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { galleryCreateSchema, formatZodErrors } from "@/lib/validators";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validation = galleryCreateSchema.safeParse(payload);
  if (!validation.success) {
    return NextResponse.json({ error: "Validation failed.", details: formatZodErrors(validation.error) }, { status: 422 });
  }

  const galleryItem = await prisma.galleryImage.update({
    where: { id },
    data: validation.data,
  });
  return NextResponse.json(galleryItem);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  await prisma.galleryImage.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
