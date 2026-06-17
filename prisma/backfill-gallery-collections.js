/**
 * Seed default gallery collections and backfill existing images.
 * Run: node prisma/backfill-gallery-collections.js
 */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const DEFAULT_COLLECTIONS = [
  {
    slug: "art",
    title: "Art & creative life",
    description: "Art, colour, and mindful creativity at Nirvana Yoga.",
    category: "ART",
    sortOrder: 0,
  },
  {
    slug: "yoga-nidra",
    title: "Yoga Nidra",
    description: "Moments from Yoga Nidra teacher training — rest, presence, and deep relaxation.",
    category: "YOGA_NIDRA",
    sortOrder: 1,
  },
  {
    slug: "japan-events",
    title: "Embassy of India in Japan",
    description: "Cultural gatherings with the Embassy of India in Japan.",
    category: "JAPAN_EVENTS",
    sortOrder: 2,
  },
];

async function main() {
  const collectionByCategory = new Map();

  for (const collection of DEFAULT_COLLECTIONS) {
    const record = await prisma.galleryCollection.upsert({
      where: { slug: collection.slug },
      update: {
        title: collection.title,
        description: collection.description,
        category: collection.category,
        sortOrder: collection.sortOrder,
      },
      create: collection,
    });
    collectionByCategory.set(collection.category, record);
    console.log(`Collection ready: ${record.slug}`);
  }

  const images = await prisma.galleryImage.findMany({ orderBy: { createdAt: "asc" } });
  let updated = 0;

  for (let index = 0; index < images.length; index += 1) {
    const image = images[index];
    const collection = collectionByCategory.get(image.category);
    if (!collection) {
      continue;
    }

    await prisma.galleryImage.update({
      where: { id: image.id },
      data: {
        collectionId: image.collectionId ?? collection.id,
        sortOrder: image.sortOrder || index,
        uploadPath: image.uploadPath ?? image.url,
      },
    });
    updated += 1;
  }

  console.log(`Backfilled ${updated} gallery image(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
