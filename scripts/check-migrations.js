const { PrismaClient } = require("@prisma/client");

async function main() {
  const prisma = new PrismaClient();
  try {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT migration_name, finished_at, rolled_back_at, logs
       FROM "_prisma_migrations"
       ORDER BY started_at`,
    );
    console.log(JSON.stringify(rows, null, 2));

    const tables = await prisma.$queryRawUnsafe(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public'
       AND table_name IN ('AdminSession', 'EventPageSection', 'Event')
       ORDER BY table_name`,
    );
    console.log("\nTables:", JSON.stringify(tables, null, 2));

    const eventCols = await prisma.$queryRawUnsafe(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'Event'
       AND column_name IN ('isSpecialEvent', 'specialEventTocMode', 'specialEventTocOverride')
       ORDER BY column_name`,
    );
    console.log("\nEvent special columns:", JSON.stringify(eventCols, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
