import { prisma } from "@/lib/prisma";
import { testimonialCreateSchema, formatZodErrors } from "@/lib/validators";
import { badRequest, serverError, jsonResponse } from "@/lib/api";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return badRequest("Invalid JSON request body.");
  }

  const validation = testimonialCreateSchema.safeParse(payload);
  if (!validation.success) {
    return badRequest(formatZodErrors(validation.error));
  }

  try {
    // Public submissions default to PENDING status
    const testimonial = await prisma.testimonial.create({
      data: {
        quote: validation.data.quote,
        name: validation.data.name,
        role: validation.data.role,
        status: "PENDING",
      },
    });
    return jsonResponse(
      {
        id: testimonial.id,
        message: "Thank you for sharing your experience. We'll review it shortly.",
      },
      201
    );
  } catch (error) {
    return serverError("Unable to submit testimonial.");
  }
}
