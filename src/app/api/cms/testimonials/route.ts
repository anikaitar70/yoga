import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { testimonialCreateSchema, formatZodErrors } from "@/lib/validators";

export async function GET() {
  const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(testimonials);
}

export async function POST(request: Request) {
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

  const statusMap: Record<string, string> = {
    pending: "PENDING",
    approved: "APPROVED",
    rejected: "REJECTED",
  };

  const testimonial = await prisma.testimonial.create({
    data: {
      quote: validation.data.quote,
      name: validation.data.name,
      role: validation.data.role,
      status: (statusMap[validation.data.status || "approved"] || "APPROVED") as any,
    },
  });
  return NextResponse.json(testimonial, { status: 201 });
}
