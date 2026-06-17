/**
 * Replace JUST_ART_LIFE page sections with the journey-with-art content.
 * Run: npm run db:update-just-art
 */
const { PrismaClient } = require("@prisma/client");
const { JUST_ART_PAGE_SECTIONS } = require("./just-art-page-sections-data");

const prisma = new PrismaClient();

async function main() {
  const deleted = await prisma.pageSection.deleteMany({ where: { pageType: "JUST_ART_LIFE" } });
  console.log(`Removed ${deleted.count} existing JUST_ART_LIFE section(s).`);

  for (let i = 0; i < JUST_ART_PAGE_SECTIONS.length; i++) {
    const section = JUST_ART_PAGE_SECTIONS[i];
    await prisma.pageSection.create({
      data: {
        pageType: "JUST_ART_LIFE",
        sortOrder: i,
        ...section,
      },
    });
  }

  console.log(`Created ${JUST_ART_PAGE_SECTIONS.length} Just Art Affaire journey sections.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
