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
  error?: string;
};

const OCR_TIMEOUT_MS = 25_000;

function resolveLocalImagePath(imageUrl: string): string | null {
  if (!imageUrl.startsWith("/uploads/")) {
    return null;
  }
  const relative = imageUrl.replace(/^\//, "").replace(/\.\./g, "");
  return path.join(process.cwd(), "public", relative);
}

export async function runTestimonialOcr(imageUrl: string): Promise<TestimonialOcrResult> {
  const localPath = resolveLocalImagePath(imageUrl);
  if (!localPath) {
    return {
      quote: "",
      name: "",
      role: "",
      city: "",
      country: "",
      extractedText: "",
      confidence: 0,
      error: "OCR only supports images uploaded to this site.",
    };
  }

  const worker = await createWorker("eng");
  try {
    const recognize = worker.recognize(localPath);
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("OCR timed out")), OCR_TIMEOUT_MS);
    });
    const { data } = await Promise.race([recognize, timeout]);
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
