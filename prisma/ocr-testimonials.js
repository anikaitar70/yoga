/**
 * Run OCR on all testimonial images in the database and populate text fields.
 * Run: node prisma/ocr-testimonials.js
 */
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { createWorker } = require("tesseract.js");

const prisma = new PrismaClient();

function cleanLine(line) {
  return line.replace(/\s+/g, " ").trim();
}

function isLikelyName(line) {
  const trimmed = cleanLine(line);
  if (trimmed.length < 2 || trimmed.length > 48) return false;
  if (/^\d|whatsapp|message|thank|namaste/i.test(trimmed)) return false;
  const words = trimmed.split(/\s+/);
  if (words.length > 5) return false;
  return /^[A-Z][a-zA-Z\-']+(\s+[A-Z][a-zA-Z\-'.]+)*$/.test(trimmed);
}

function parseOcrText(raw) {
  const lines = raw
    .split(/\r?\n/)
    .map(cleanLine)
    .filter((line) => line.length > 1);

  let name = "";
  let role = "";
  let city = "";
  let country = "";
  const quoteLines = [];

  for (const line of lines) {
    if (!name && isLikelyName(line)) {
      name = line;
      continue;
    }
    if (/^(yoga|student|participant)/i.test(line) && line.length < 60) {
      role = line;
      continue;
    }
    const locMatch = line.match(/([A-Z][a-z]+),\s*(Japan|India)/);
    if (locMatch) {
      city = locMatch[1];
      country = locMatch[2];
      continue;
    }
    quoteLines.push(line);
  }

  return {
    quote: quoteLines.join(" ").replace(/\s{2,}/g, " ").trim(),
    name,
    role,
    city,
    country,
    extractedText: raw.trim(),
  };
}

async function ocrImage(imageUrl) {
  const localPath = imageUrl.startsWith("/uploads/")
    ? path.join(process.cwd(), "public", imageUrl.replace(/^\//, ""))
    : imageUrl;

  const worker = await createWorker("eng");
  try {
    const { data } = await worker.recognize(localPath);
    return { text: data.text, confidence: data.confidence };
  } finally {
    await worker.terminate();
  }
}

async function main() {
  const testimonials = await prisma.testimonial.findMany({
    where: { imageUrl: { not: null } },
    orderBy: { createdAt: "asc" },
  });

  if (testimonials.length === 0) {
    console.log("No image testimonials found. Run npm run db:seed-testimonials first.");
    return;
  }

  console.log(`Processing ${testimonials.length} testimonial image(s)…`);

  for (const item of testimonials) {
    if (!item.imageUrl) continue;

    try {
      console.log(`OCR: ${item.imageUrl}`);
      const { text, confidence } = await ocrImage(item.imageUrl);
      const parsed = parseOcrText(text);

      await prisma.testimonial.update({
        where: { id: item.id },
        data: {
          quote: parsed.quote || item.quote,
          name: parsed.name || item.name,
          role: parsed.role || item.role,
          city: parsed.city || item.city,
          country: parsed.country || item.country,
          extractedText: parsed.extractedText,
          sourceType: "OCR",
          displayStyle: "HANDWRITTEN",
          ocrConfidence: confidence,
        },
      });

      console.log(`  ✓ ${parsed.name || item.name || "Unknown"} — ${Math.round(confidence)}% confidence`);
    } catch (error) {
      console.error(`  ✗ Failed for ${item.imageUrl}:`, error.message);
    }
  }

  console.log("OCR batch complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
