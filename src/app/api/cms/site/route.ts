import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { siteUpdateSchema, formatZodErrors } from "@/lib/validators";

export async function GET() {
  const record = await prisma.siteConfig.findFirst();
  if (!record) {
    return NextResponse.json({ error: "Site config not found." }, { status: 404 });
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

  const validation = siteUpdateSchema.safeParse(payload);
  if (!validation.success) {
    return NextResponse.json({ error: "Validation failed.", details: formatZodErrors(validation.error) }, { status: 422 });
  }

  const record = await prisma.siteConfig.findFirst();
  const data = validation.data;

  const siteData: any = {
    name: data.name,
    tagline: data.tagline,
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone,
    contactAddress: data.contactAddress,
  };

  if (data.social !== undefined) {
    siteData.social = data.social;
  }

  const result = record
    ? await prisma.siteConfig.update({ where: { id: record.id }, data: siteData })
    : await prisma.siteConfig.create({ data: siteData });

  return NextResponse.json(result);
}
