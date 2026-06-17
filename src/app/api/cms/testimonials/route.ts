import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { testimonialCreateSchema, formatZodErrors } from "@/lib/validators";
import { mapAdminTestimonial } from "@/lib/testimonial-map";
import { revalidateTestimonialPaths } from "@/lib/testimonial-revalidate";
import { requireAdminSession } from "@/lib/require-admin-session";

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

function buildTestimonialData(data: Record<string, unknown>) {
  const payload: Record<string, unknown> = {};
  if (data.quote !== undefined) payload.quote = String(data.quote).trim();
  if (data.name !== undefined) payload.name = String(data.name).trim();
  if (data.role !== undefined) payload.role = String(data.role).trim();
  if (data.city !== undefined) payload.city = data.city ? String(data.city).trim() : null;
  if (data.country !== undefined) payload.country = data.country ? String(data.country).trim() : null;
  if (data.imageUrl !== undefined) payload.imageUrl = data.imageUrl;
  if (data.imageAlt !== undefined) payload.imageAlt = data.imageAlt;
  if (data.extractedText !== undefined) payload.extractedText = data.extractedText;
  if (data.ocrConfidence !== undefined) payload.ocrConfidence = data.ocrConfidence;
  if (data.featured !== undefined) payload.featured = data.featured;
  if (data.sortOrder !== undefined) payload.sortOrder = data.sortOrder;
  if (data.status !== undefined) payload.status = mapStatusInput(String(data.status));
  if (data.sourceType !== undefined) payload.sourceType = mapSourceType(String(data.sourceType));
  if (data.displayStyle !== undefined) payload.displayStyle = mapDisplayStyle(String(data.displayStyle));
  return payload;
}

export async function GET() {
  const denied = await requireAdminSession();
  if (denied) return denied;

  const testimonials = await prisma.testimonial.findMany({
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(testimonials.map(mapAdminTestimonial));
}

export async function POST(request: Request) {
  const denied = await requireAdminSession();
  if (denied) return denied;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validation = testimonialCreateSchema.safeParse(payload);
  if (!validation.success) {
    return NextResponse.json({ error: "Validation failed.", details: formatZodErrors(validation.error) }, { status: 422 });
  }

  const maxSort = await prisma.testimonial.aggregate({ _max: { sortOrder: true } });
  const data = buildTestimonialData(validation.data) as Record<string, unknown>;
  if (data.sortOrder === undefined) {
    data.sortOrder = (maxSort._max.sortOrder ?? -1) + 1;
  }

  const testimonial = await prisma.testimonial.create({ data: data as never });
  revalidateTestimonialPaths();

  return NextResponse.json(mapAdminTestimonial(testimonial), { status: 201 });
}
