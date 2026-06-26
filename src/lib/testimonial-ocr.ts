import fs from "fs/promises";
import path from "path";
import { createWorker, type Worker } from "tesseract.js";
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

const OCR_TOTAL_TIMEOUT_MS = 45_000;
const TESSDATA_DIR = path.join(process.cwd(), "tessdata");
const TESS_CACHE_DIR =
  process.env.TESSERACT_CACHE_DIR ?? path.join(process.cwd(), ".tesseract-cache");

let sharedWorker: Promise<Worker> | null = null;
let ocrChain: Promise<unknown> = Promise.resolve();

function resolveLocalImagePath(imageUrl: string): string | null {
  if (!imageUrl.startsWith("/uploads/")) {
    return null;
  }
  const relative = imageUrl.replace(/^\//, "").replace(/\.\./g, "");
  return path.join(process.cwd(), "public", relative);
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

async function hasBundledTessdata(): Promise<boolean> {
  try {
    await fs.access(path.join(TESSDATA_DIR, "eng.traineddata.gz"));
    return true;
  } catch {
    try {
      await fs.access(path.join(TESSDATA_DIR, "eng.traineddata"));
      return true;
    } catch {
      return false;
    }
  }
}

async function getWorkerOptions() {
  await ensureDir(TESS_CACHE_DIR);
  if (await hasBundledTessdata()) {
    return {
      langPath: TESSDATA_DIR,
      cachePath: TESS_CACHE_DIR,
      gzip: true,
    };
  }
  return {
    cachePath: TESS_CACHE_DIR,
    gzip: true,
  };
}

async function getSharedWorker(): Promise<Worker> {
  if (!sharedWorker) {
    sharedWorker = (async () => {
      const worker = await createWorker("eng", undefined, await getWorkerOptions());
      return worker;
    })();
  }
  return sharedWorker;
}

async function resetSharedWorker() {
  if (!sharedWorker) {
    return;
  }
  try {
    const worker = await sharedWorker;
    await worker.terminate();
  } catch {
    // ignore
  }
  sharedWorker = null;
}

async function prepareOcrImage(localPath: string): Promise<Buffer> {
  try {
    const { default: sharp } = await import("sharp");
    return sharp(localPath, { failOn: "none" })
      .rotate()
      .resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true })
      .png()
      .toBuffer();
  } catch {
    return fs.readFile(localPath);
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out`)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function enqueueOcr<T>(task: () => Promise<T>): Promise<T> {
  const next = ocrChain.then(task, task);
  ocrChain = next.catch(() => {});
  return next;
}

const emptyResult = (): Omit<TestimonialOcrResult, "error"> => ({
  quote: "",
  name: "",
  role: "",
  city: "",
  country: "",
  extractedText: "",
  confidence: 0,
});

export async function runTestimonialOcr(imageUrl: string): Promise<TestimonialOcrResult> {
  const localPath = resolveLocalImagePath(imageUrl);
  if (!localPath) {
    return {
      ...emptyResult(),
      error: "OCR only supports images uploaded to this site.",
    };
  }

  return enqueueOcr(() =>
    withTimeout(
      (async () => {
        try {
          const input = await prepareOcrImage(localPath);
          const worker = await getSharedWorker();
          const { data } = await worker.recognize(input);
          const extractedText = data.text.trim();
          const parsed = parseTestimonialOcrText(extractedText);

          return {
            ...parsed,
            extractedText,
            confidence: data.confidence,
          };
        } catch (error) {
          await resetSharedWorker();
          const message = error instanceof Error ? error.message : "OCR failed.";
          return {
            ...emptyResult(),
            error: message.includes("timed out")
              ? "OCR timed out. You can still save the testimonial and enter text manually."
              : "OCR could not read this image. You can still save the testimonial and enter text manually.",
          };
        }
      })(),
      OCR_TOTAL_TIMEOUT_MS,
      "OCR",
    ),
  );
}
