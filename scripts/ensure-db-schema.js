/**
 * Applies lightweight SQL patches when prisma db push was skipped or an old DB is in use.
 * Safe to run on every dev start (uses IF NOT EXISTS).
 */
const { PrismaClient } = require("@prisma/client");

const PATCHES = [
  `ALTER TABLE "SiteConfig" ADD COLUMN IF NOT EXISTS "homepageLayout" JSONB`,
  `ALTER TABLE "SiteConfig" ADD COLUMN IF NOT EXISTS "branding" JSONB`,
  `ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "externalUrl" TEXT`,
  `ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "eventDetail" JSONB`,
  `ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "externalLinkLabel" TEXT`,
  `ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "jaLocale" JSONB`,
  `ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "jaLocale" JSONB`,
  `ALTER TABLE "Testimonial" ADD COLUMN IF NOT EXISTS "jaLocale" JSONB`,
];

const BACKFILL_SORT_ORDER = `
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "startsAt" ASC, "createdAt" ASC) - 1 AS next_order
  FROM "Event"
  WHERE "sortOrder" = 0
)
UPDATE "Event" AS e
SET "sortOrder" = ranked.next_order
FROM ranked
WHERE e.id = ranked.id
  AND (SELECT COUNT(*) FROM "Event") > 1;
`;

async function main() {
  const prisma = new PrismaClient();
  try {
    for (const sql of PATCHES) {
      await prisma.$executeRawUnsafe(sql);
    }
    await prisma.$executeRawUnsafe(BACKFILL_SORT_ORDER);
    console.log("Database schema patches applied.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("ensure-db-schema failed:", error.message);
  process.exit(1);
});
