/**
 * Audit testimonial pipeline counts for homepage display.
 * Usage: node scripts/audit-testimonials.js
 */
const { PrismaClient } = require("@prisma/client");

function testimonialDisplayQuote(testimonial) {
  return testimonial.quote?.trim() || testimonial.extractedText?.trim() || "";
}

function testimonialIsRenderable(testimonial) {
  return Boolean(testimonialDisplayQuote(testimonial) || testimonial.imageUrl?.trim());
}

function dedupeTestimonialsForCarousel(testimonials) {
  const seenIds = new Set();
  const result = [];
  for (const item of testimonials) {
    if (!testimonialIsRenderable(item)) continue;
    if (seenIds.has(item.id)) continue;
    seenIds.add(item.id);
    result.push(item);
  }
  return result;
}

async function main() {
  const prisma = new PrismaClient();

  const all = await prisma.testimonial.findMany({
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
  });

  const approved = all.filter((t) => t.status === "APPROVED");
  const pending = all.filter((t) => t.status === "PENDING");
  const rejected = all.filter((t) => t.status === "REJECTED");

  const mapped = approved.map((item) => ({
    id: item.id,
    quote: item.quote?.trim() || item.extractedText?.trim() || "",
    name: item.name,
    imageUrl: item.imageUrl ?? undefined,
    extractedText: item.extractedText ?? undefined,
    status: item.status,
  }));

  const renderable = mapped.filter((t) => testimonialIsRenderable(t));
  const carousel = dedupeTestimonialsForCarousel(mapped);
  const skipped = mapped.filter((t) => !testimonialIsRenderable(t));

  console.log("=== Testimonial audit ===");
  console.log("Total in database:", all.length);
  console.log("Approved:", approved.length);
  console.log("Pending (hidden):", pending.length);
  console.log("Rejected (hidden):", rejected.length);
  console.log("Approved + renderable:", renderable.length);
  console.log("Carousel output count:", carousel.length);

  if (skipped.length > 0) {
    console.log("\nApproved but not renderable (missing quote and image):");
    for (const item of skipped) {
      console.log(` - ${item.id} | ${item.name || "(no name)"}`);
    }
  }

  if (pending.length > 0) {
    console.log("\nPending review (not on site until approved):");
    for (const item of pending) {
      console.log(` - ${item.id} | ${item.name || "(no name)"}`);
    }
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
