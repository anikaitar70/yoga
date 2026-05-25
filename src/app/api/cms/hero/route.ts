import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { heroUpdateSchema, formatZodErrors } from "@/lib/validators";

export async function GET() {
  const record = await prisma.heroSection.findFirst();
  if (!record) {
    return NextResponse.json({ error: "Hero section not found." }, { status: 404 });
  }

  return NextResponse.json({
    id: record.id,
    title: record.title,
    subtitle: record.subtitle,
    primaryCtaLabel: record.primaryCtaLabel,
    primaryCtaHref: record.primaryCtaHref,
    secondaryCtaLabel: record.secondaryCtaLabel,
    secondaryCtaHref: record.secondaryCtaHref,
    imageSrc: record.imageSrc,
    imageAlt: record.imageAlt,
  });
}

export async function PUT(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validation = heroUpdateSchema.safeParse(payload);
  if (!validation.success) {
    return NextResponse.json({ error: "Validation failed.", details: formatZodErrors(validation.error) }, { status: 422 });
  }

  const record = await prisma.heroSection.findFirst();
  const data = validation.data;

  const result = record
    ? await prisma.heroSection.update({ where: { id: record.id }, data })
    : await prisma.heroSection.create({ data });

  return NextResponse.json(result);
}
