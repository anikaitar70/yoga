import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { testimonialUpdateSchema, formatZodErrors } from "@/lib/validators";

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

  const validation = testimonialUpdateSchema.safeParse(payload);
  if (!validation.success) {
    return NextResponse.json({ error: "Validation failed.", details: formatZodErrors(validation.error) }, { status: 422 });
  }

  const statusMap: Record<string, string> = {
    pending: "PENDING",
    approved: "APPROVED",
    rejected: "REJECTED",
  };

  const updateData: any = {};
  if (validation.data.quote !== undefined) updateData.quote = validation.data.quote;
  if (validation.data.name !== undefined) updateData.name = validation.data.name;
  if (validation.data.role !== undefined) updateData.role = validation.data.role;
  if (validation.data.status !== undefined) {
    updateData.status = statusMap[validation.data.status] || "APPROVED";
  }

  const testimonial = await prisma.testimonial.update({
    where: { id },
    data: updateData,
  });
  return NextResponse.json(testimonial);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  await prisma.testimonial.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
