import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { aboutUpdateSchema, formatZodErrors } from "@/lib/validators";

export async function GET() {
  const record = await prisma.aboutPage.findFirst();
  if (!record) {
    return NextResponse.json({ error: "About page not found." }, { status: 404 });
  }

  return NextResponse.json(record);
}

export async function PUT(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validation = aboutUpdateSchema.safeParse(payload);
  if (!validation.success) {
    return NextResponse.json({ error: "Validation failed.", details: formatZodErrors(validation.error) }, { status: 422 });
  }

  const record = await prisma.aboutPage.findFirst();
  const data = validation.data;

  const result = record
    ? await prisma.aboutPage.update({ where: { id: record.id }, data })
    : await prisma.aboutPage.create({ data });

  return NextResponse.json(result);
}
