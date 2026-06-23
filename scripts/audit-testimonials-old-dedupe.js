const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function quote(t) {
  return (t.quote || t.extractedText || "").trim();
}

function oldDedupe(items) {
  const withQuote = items.filter((t) => quote(t));
  const bestByImage = new Map();
  for (const item of withQuote) {
    const imageKey = item.imageUrl?.trim();
    if (!imageKey) continue;
    const existing = bestByImage.get(imageKey);
    if (!existing || quote(item).length > quote(existing).length) {
      bestByImage.set(imageKey, item);
    }
  }
  const seenImages = new Set();
  const seenNames = new Set();
  const result = [];
  for (const item of withQuote) {
    const imageKey = item.imageUrl?.trim();
    if (imageKey) {
      if (bestByImage.get(imageKey)?.id !== item.id) continue;
      if (seenImages.has(imageKey)) continue;
      seenImages.add(imageKey);
    }
    const nameKey = item.name?.trim().toLowerCase();
    if (nameKey) {
      if (seenNames.has(nameKey)) continue;
      seenNames.add(nameKey);
    }
    result.push(item);
  }
  return result;
}

(async () => {
  const all = await prisma.testimonial.findMany({ where: { status: "APPROVED" } });
  const old = oldDedupe(all);
  console.log("Old carousel count:", old.length, "of", all.length);
  const oldIds = new Set(old.map((t) => t.id));
  const missing = all.filter((t) => !oldIds.has(t.id));
  if (missing.length) {
    console.log("Hidden by old dedupe:");
    for (const t of missing) {
      console.log(" -", t.id, t.name, "| quote len:", quote(t).length);
    }
  }
  await prisma.$disconnect();
})();
