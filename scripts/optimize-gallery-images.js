/**
 * Backfill WebP thumbnail/medium/full variants for existing gallery uploads.
 * Run: node scripts/optimize-gallery-images.js
 */
const fs = require("fs/promises");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

async function loadSharp() {
  const mod = await import("sharp");
  return mod.default;
}

function variantFilename(baseFilename, suffix) {
  const dot = baseFilename.lastIndexOf(".");
  const stem = dot >= 0 ? baseFilename.slice(0, dot) : baseFilename;
  return `${stem}-${suffix}.webp`;
}

async function generateVariants(sharp, buffer) {
  const image = sharp(buffer, { failOn: "none" }).rotate();
  const metadata = await image.metadata();
  const [full, medium, thumbnail] = await Promise.all([
    image.clone().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer(),
    image.clone().resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer(),
    image.clone().resize({ width: 400, height: 400, fit: "inside", withoutEnlargement: true }).webp({ quality: 78 }).toBuffer(),
  ]);
  return { full, medium, thumbnail, width: metadata.width ?? 0, height: metadata.height ?? 0 };
}

async function main() {
  const sharp = await loadSharp();
  const prisma = new PrismaClient();
  const images = await prisma.galleryImage.findMany({
    where: { thumbnailUrl: null },
  });

  console.log(`Processing ${images.length} gallery image(s) without variants…`);

  for (const record of images) {
    const relative = record.url.replace(/^\//, "");
    const filePath = path.join(process.cwd(), "public", relative);
    try {
      await fs.access(filePath);
    } catch {
      console.warn(`Skip missing file: ${record.url}`);
      continue;
    }

    const buffer = await fs.readFile(filePath);
    const baseName = path.basename(filePath);
    const dir = path.dirname(filePath);
    const variants = await generateVariants(sharp, buffer);
    const names = {
      full: variantFilename(baseName, "full"),
      medium: variantFilename(baseName, "medium"),
      thumbnail: variantFilename(baseName, "thumb"),
    };

    await Promise.all([
      fs.writeFile(path.join(dir, names.full), variants.full),
      fs.writeFile(path.join(dir, names.medium), variants.medium),
      fs.writeFile(path.join(dir, names.thumbnail), variants.thumbnail),
    ]);

    const publicDir = path.dirname(record.url);
    const thumbnailUrl = `${publicDir}/${names.thumbnail}`.replace(/\\/g, "/");
    const mediumUrl = `${publicDir}/${names.medium}`.replace(/\\/g, "/");
    const fullUrl = `${publicDir}/${names.full}`.replace(/\\/g, "/");

    await prisma.galleryImage.update({
      where: { id: record.id },
      data: {
        url: fullUrl,
        thumbnailUrl,
        mediumUrl,
        width: variants.width,
        height: variants.height,
      },
    });

    console.log(`Optimized: ${record.id}`);
  }

  await prisma.$disconnect();
  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
