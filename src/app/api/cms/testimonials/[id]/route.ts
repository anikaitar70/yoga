import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { testimonialUpdateSchema, formatZodErrors } from "@/lib/validators";
import { mapAdminTestimonial } from "@/lib/testimonial-map";
import { revalidateTestimonialPaths } from "@/lib/testimonial-revalidate";
import { requireAdminSession } from "@/lib/require-admin-session";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

function mapStatusInput(status?: string) {
  const statusMap: Record<string, string> = {
    pending: "PENDING",
    approved: "APPROVED",
    rejected: "REJECTED",
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
  };
  return statusMap[status || "approved"] || "APPROVED";
}

function mapSourceType(value?: string) {
  const map: Record<string, string> = {
    text: "TEXT",
    image: "IMAGE",
    ocr: "OCR",
    TEXT: "TEXT",
    IMAGE: "IMAGE",
    OCR: "OCR",
  };
  return map[value || "text"] || "TEXT";
}

function mapDisplayStyle(value?: string) {
  const map: Record<string, string> = {
    card: "CARD",
    handwritten: "HANDWRITTEN",
    CARD: "CARD",
    HANDWRITTEN: "HANDWRITTEN",
  };
  return map[value || "handwritten"] || "HANDWRITTEN";
}

export async function PUT(request: Request, context: RouteContext) {
  const denied = await requireAdminSession();
  if (denied) return denied;

  const { id } = await context.params;
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validation = testimonialUpdateSchema.safeParse(payload);
  if (!validation.success) {
    return NextResponse.json({ error: "Validation failed.", details: formatZodErrors(validation.error) }, { status: 422 });
  }

  const updateData: Record<string, unknown> = {};
  const data = validation.data;
  if (data.quote !== undefined) updateData.quote = data.quote;
  if (data.name !== undefined) updateData.name = data.name;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.city !== undefined) updateData.city = data.city || null;
  if (data.country !== undefined) updateData.country = data.country || null;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
  if (data.imageAlt !== undefined) updateData.imageAlt = data.imageAlt;
  if (data.extractedText !== undefined) updateData.extractedText = data.extractedText;
  if (data.ocrConfidence !== undefined) updateData.ocrConfidence = data.ocrConfidence;
  if (data.featured !== undefined) updateData.featured = data.featured;
  if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
  if (data.status !== undefined) updateData.status = mapStatusInput(data.status);
  if (data.sourceType !== undefined) updateData.sourceType = mapSourceType(data.sourceType);
  if (data.displayStyle !== undefined) updateData.displayStyle = mapDisplayStyle(data.displayStyle);

  const testimonial = await prisma.testimonial.update({
    where: { id },
    data: updateData,
  });

  revalidateTestimonialPaths();

  return NextResponse.json(mapAdminTestimonial(testimonial));
}

export async function DELETE(_request: Request, context: RouteContext) {
  const denied = await requireAdminSession();
  if (denied) return denied;

  const { id } = await context.params;
  await prisma.testimonial.delete({ where: { id } });
  revalidateTestimonialPaths();
  return new Response(null, { status: 204 });
}
