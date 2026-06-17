import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin-session";
import { heroUpdateSchema, formatZodErrors } from "@/lib/validators";

export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

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
    mediaMode: record.mediaMode,
    rotatingImages: record.rotatingImages,
    collageId: record.collageId,
    featuredCollectionId: record.featuredCollectionId,
  });
}

export async function PUT(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

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

  return NextResponse.json({
    id: result.id,
    title: result.title,
    subtitle: result.subtitle,
    primaryCtaLabel: result.primaryCtaLabel,
    primaryCtaHref: result.primaryCtaHref,
    secondaryCtaLabel: result.secondaryCtaLabel,
    secondaryCtaHref: result.secondaryCtaHref,
    imageSrc: result.imageSrc,
    imageAlt: result.imageAlt,
    mediaMode: result.mediaMode,
    rotatingImages: result.rotatingImages,
    collageId: result.collageId,
    featuredCollectionId: result.featuredCollectionId,
  });
}
