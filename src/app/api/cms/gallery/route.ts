import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { galleryCreateSchema, formatZodErrors } from "@/lib/validators";

export async function GET() {
  const gallery = await prisma.galleryImage.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(gallery);
}

export async function POST(request: Request) {
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

  const gallery = await prisma.galleryImage.create({ data: validation.data });
  return NextResponse.json(gallery, { status: 201 });
}
