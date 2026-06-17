/**
 * Import community photos into GalleryCollection + GalleryImage.
 * Preserves source folder grouping under public/uploads/gallery/{collection-slug}/.
 *
 * Run: npm run db:import-gallery
 */
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const PROJECT_ROOT = process.env.GALLERY_IMPORT_ROOT
  ? path.resolve(process.env.GALLERY_IMPORT_ROOT)
  : path.join(__dirname, "..");

const GALLERY_UPLOAD_ROOT = path.join(PROJECT_ROOT, "public", "uploads", "gallery");
const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;

const IMPORT_SOURCES = [
  {
    sourceId: "art",
    slug: "art",
    dirNames: ["art"],
    category: "ART",
    title: "Art & creative life",
    description: "Art, colour, and mindful creativity at Nirvana Yoga.",
    titlePrefix: "Art & studio moment",
    altPrefix: "Art and creative practice",
    featuredSlots: 2,
    sortOrder: 0,
  },
  {
    sourceId: "yoga-nidra",
    slug: "yoga-nidra",
    dirNames: ["yoga nidra", "YogaNidra teachers training"],
    category: "YOGA_NIDRA",
    title: "Yoga Nidra",
    description: "Moments from Yoga Nidra teacher training — rest, presence, and deep relaxation.",
    titlePrefix: "Yoga Nidra training",
    altPrefix: "Yoga Nidra teacher training",
    featuredSlots: 2,
    sortOrder: 1,
  },
  {
    sourceId: "indian-embassy-japan",
    slug: "japan-events",
    dirNames: ["indian embassy at japan"],
    category: "JAPAN_EVENTS",
    title: "Embassy of India in Japan",
    description: "Nirvana Yoga at a cultural gathering with the Embassy of India in Japan.",
    titlePrefix: "Embassy of India in Japan",
    altPrefix: "Cultural event at the Embassy of India in Japan",
    featuredSlots: 1,
    sortOrder: 2,
  },
];

function slugifyFilename(name) {
  const base = name.replace(/\.[^.]+$/, "");
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function buildUploadFilename(originalName, extension) {
  const slug = slugifyFilename(originalName) || "image";
  const unique = crypto.randomBytes(4).toString("hex");
  const timestamp = Date.now();
  return `${slug}-${timestamp}-${unique}.${extension}`;
}

function extensionForFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".jpeg" || ext === ".jpg") return "jpg";
  if (ext === ".png") return "png";
  if (ext === ".webp") return "webp";
  if (ext === ".gif") return "gif";
  return null;
}

function resolveSourceDir(dirNames) {
  for (const dirName of dirNames) {
    const candidate = path.join(PROJECT_ROOT, dirName);
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
      return candidate;
    }
  }
  return null;
}

function listImageFiles(dirPath) {
  return fs
    .readdirSync(dirPath)
    .filter((file) => IMAGE_EXT.test(file))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

function buildMetadata(source, index, total) {
  const number = index + 1;
  return {
    title: `${source.titlePrefix} ${number}`,
    altText: `${source.altPrefix} — photo ${number} of ${total}`,
    description: source.description,
  };
}

function buildSourceKey(sourceId, filename) {
  return `${sourceId}:${filename}`;
}

async function ensureCollection(source) {
  return prisma.galleryCollection.upsert({
    where: { slug: source.slug },
    update: {
      title: source.title,
      description: source.description,
      category: source.category,
      sortOrder: source.sortOrder,
    },
    create: {
      slug: source.slug,
      title: source.title,
      description: source.description,
      category: source.category,
      sortOrder: source.sortOrder,
    },
  });
}

async function importSource(source) {
  const collection = await ensureCollection(source);
  const dirPath = resolveSourceDir(source.dirNames);
  if (!dirPath) {
    console.warn(
      `Skip ${source.sourceId}: none of [${source.dirNames.join(", ")}] found under ${PROJECT_ROOT}`,
    );
    return { imported: 0, skipped: 0, featured: 0 };
  }

  const files = listImageFiles(dirPath);
  if (files.length === 0) {
    console.warn(`Skip ${source.sourceId}: no images in ${dirPath}`);
    return { imported: 0, skipped: 0, featured: 0 };
  }

  const uploadDir = path.join(GALLERY_UPLOAD_ROOT, source.slug);
  fs.mkdirSync(uploadDir, { recursive: true });

  let imported = 0;
  let skipped = 0;
  let featured = 0;

  for (let index = 0; index < files.length; index += 1) {
    const filename = files[index];
    const sourceKey = buildSourceKey(source.sourceId, filename);

    const existing = await prisma.galleryImage.findUnique({ where: { sourceKey } });
    if (existing) {
      skipped += 1;
      continue;
    }

    const srcPath = path.join(dirPath, filename);
    const extension = extensionForFile(filename);
    if (!extension) {
      skipped += 1;
      continue;
    }

    const destFilename = buildUploadFilename(filename, extension);
    const destPath = path.join(uploadDir, destFilename);
    fs.copyFileSync(srcPath, destPath);

    const url = `/uploads/gallery/${source.slug}/${destFilename}`;
    const meta = buildMetadata(source, index, files.length);
    const featuredOnHomepage = index < source.featuredSlots;

    await prisma.galleryImage.create({
      data: {
        url,
        uploadPath: url,
        title: meta.title,
        altText: meta.altText,
        description: meta.description,
        category: source.category,
        collectionId: collection.id,
        sortOrder: index,
        sourceKey,
        featuredOnHomepage,
        isPublished: true,
      },
    });

    imported += 1;
    if (featuredOnHomepage) featured += 1;
  }

  console.log(
    `${source.slug}: ${imported} imported, ${skipped} skipped, ${featured} featured`,
  );
  return { imported, skipped, featured };
}

async function main() {
  console.log(`Project root: ${PROJECT_ROOT}`);

  const totals = { imported: 0, skipped: 0, featured: 0 };
  for (const source of IMPORT_SOURCES) {
    const result = await importSource(source);
    totals.imported += result.imported;
    totals.skipped += result.skipped;
    totals.featured += result.featured;
  }

  const publishedCount = await prisma.galleryImage.count({ where: { isPublished: true } });
  console.log(
    `Done. Imported ${totals.imported}, skipped ${totals.skipped}, featured ${totals.featured}. Published total: ${publishedCount}.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
