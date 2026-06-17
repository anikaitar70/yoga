import path from "path";
import { createWorker } from "tesseract.js";
import { parseTestimonialOcrText } from "@/lib/testimonial-ocr-parse";

export type TestimonialOcrResult = {
  quote: string;
  name: string;
  role: string;
  city: string;
  country: string;
  extractedText: string;
  confidence: number;
};

function resolveLocalImagePath(imageUrl: string): string | null {
  if (!imageUrl.startsWith("/uploads/")) {
    return null;
  }
  const relative = imageUrl.replace(/^\//, "").replace(/\.\./g, "");
  return path.join(process.cwd(), "public", relative);
}

export async function runTestimonialOcr(imageUrl: string): Promise<TestimonialOcrResult> {
  const localPath = resolveLocalImagePath(imageUrl);
  const source = localPath ?? imageUrl;

  const worker = await createWorker("eng");
  try {
    const { data } = await worker.recognize(source);
    const extractedText = data.text.trim();
    const parsed = parseTestimonialOcrText(extractedText);

    return {
      ...parsed,
      extractedText,
      confidence: data.confidence,
    };
  } finally {
    await worker.terminate();
  }
}
