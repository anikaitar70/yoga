/**
 * Applies lightweight SQL patches when prisma db push was skipped or an old DB is in use.
 * Safe to run on every dev start (uses IF NOT EXISTS).
 */
const { PrismaClient } = require("@prisma/client");

const PATCHES = [
  `ALTER TABLE "SiteConfig" ADD COLUMN IF NOT EXISTS "homepageLayout" JSONB`,
  `ALTER TABLE "SiteConfig" ADD COLUMN IF NOT EXISTS "branding" JSONB`,
];

async function main() {
  const prisma = new PrismaClient();
  try {
    for (const sql of PATCHES) {
      await prisma.$executeRawUnsafe(sql);
    }
    console.log("Database schema patches applied.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("ensure-db-schema failed:", error.message);
  process.exit(1);
});
