/**
 * Seed program page sections with real Nirvana Yoga content.
 * Run: node prisma/seed-page-sections.js
 */
const { PrismaClient } = require("@prisma/client");
const { HEALING_PAGE_SECTIONS } = require("./healing-page-sections-data");
const { JUST_ART_PAGE_SECTIONS } = require("./just-art-page-sections-data");
const { YOGA_PAGE_SECTIONS } = require("./yoga-page-sections-data");
const { buildAboutPageSections } = require("./about-page-sections-data");

const prisma = new PrismaClient();

async function seedPage(pageType, sections) {
  const existing = await prisma.pageSection.count({ where: { pageType } });
  if (existing > 0) {
    console.log(`Skipping ${pageType} — ${existing} section(s) already exist.`);
    return;
  }

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    await prisma.pageSection.create({
      data: {
        pageType,
        sortOrder: i,
        ...section,
      },
    });
  }
  console.log(`Seeded ${sections.length} sections for ${pageType}.`);
}

async function main() {
  await seedPage("YOGA", YOGA_PAGE_SECTIONS);

  await seedPage("HEALING", HEALING_PAGE_SECTIONS);

  await seedPage("JUST_ART_LIFE", JUST_ART_PAGE_SECTIONS);

  const aboutPage = await prisma.aboutPage.findFirst();
  await seedPage(
    "ABOUT",
    buildAboutPageSections({
      imageSrc: aboutPage?.imageSrc,
      imageAlt: aboutPage?.imageAlt,
      paragraphs: aboutPage?.paragraphs ?? [],
    }),
  );

  console.log("Page section seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
