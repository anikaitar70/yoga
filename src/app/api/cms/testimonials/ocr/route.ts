import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/require-admin-session";
import { runTestimonialOcr } from "@/lib/testimonial-ocr";
import { imageUrlSchema, formatZodErrors } from "@/lib/validators";

export const maxDuration = 60;

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
    if (result.error) {
      return NextResponse.json({
        quote: "",
        name: "",
        role: "",
        city: "",
        country: "",
        extractedText: "",
        confidence: 0,
        ocrFailed: true,
        error: result.error,
      });
    }
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "OCR failed.";
    console.error("Testimonial OCR failed:", error);
    return NextResponse.json({
      quote: "",
      name: "",
      role: "",
      city: "",
      country: "",
      extractedText: "",
      confidence: 0,
      ocrFailed: true,
      error:
        message.includes("timed out")
          ? "OCR timed out. You can still save the testimonial and enter text manually."
          : "OCR failed. You can still save the testimonial and enter text manually.",
    });
  }
}
