/**
 * Replace HEALING page sections with the journey-into-healing content.
 * Run: npm run db:update-healing
 */
const { PrismaClient } = require("@prisma/client");
const { HEALING_PAGE_SECTIONS } = require("./healing-page-sections-data");

const prisma = new PrismaClient();

async function main() {
  const deleted = await prisma.pageSection.deleteMany({ where: { pageType: "HEALING" } });
  console.log(`Removed ${deleted.count} existing HEALING section(s).`);

  for (let i = 0; i < HEALING_PAGE_SECTIONS.length; i++) {
    const section = HEALING_PAGE_SECTIONS[i];
    await prisma.pageSection.create({
      data: {
        pageType: "HEALING",
        sortOrder: i,
        ...section,
      },
    });
  }

  console.log(`Created ${HEALING_PAGE_SECTIONS.length} HEALING journey sections.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
