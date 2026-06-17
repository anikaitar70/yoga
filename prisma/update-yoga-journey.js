/**
 * Replace YOGA page sections with the journey-of-yoga content.
 * Run: npm run db:update-yoga
 */
const { PrismaClient } = require("@prisma/client");
const { YOGA_PAGE_SECTIONS } = require("./yoga-page-sections-data");

const prisma = new PrismaClient();

async function main() {
  const deleted = await prisma.pageSection.deleteMany({ where: { pageType: "YOGA" } });
  console.log(`Removed ${deleted.count} existing YOGA section(s).`);

  for (let i = 0; i < YOGA_PAGE_SECTIONS.length; i++) {
    const section = YOGA_PAGE_SECTIONS[i];
    await prisma.pageSection.create({
      data: {
        pageType: "YOGA",
        sortOrder: i,
        ...section,
      },
    });
  }

  console.log(`Created ${YOGA_PAGE_SECTIONS.length} YOGA journey sections.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
