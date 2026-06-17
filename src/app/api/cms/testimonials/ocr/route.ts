import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/require-admin-session";
import { runTestimonialOcr } from "@/lib/testimonial-ocr";
import { imageUrlSchema, formatZodErrors } from "@/lib/validators";

const ocrRequestSchema = z.object({
  imageUrl: imageUrlSchema,
});

export async function POST(request: Request) {
  const denied = await requireAdminSession();
  if (denied) {
    return denied;
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validation = ocrRequestSchema.safeParse(payload);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Validation failed.", details: formatZodErrors(validation.error) },
      { status: 422 },
    );
  }

  try {
    const result = await runTestimonialOcr(validation.data.imageUrl);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Testimonial OCR failed:", error);
    return NextResponse.json(
      { error: "OCR failed. Check the image and try again." },
      { status: 500 },
    );
  }
}
