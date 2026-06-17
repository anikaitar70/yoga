/**
 * Migrate About page body content from AboutPage table into PageSection rows (pageType ABOUT).
 * Run: node prisma/migrate-about-page-sections.js
 */
const { PrismaClient } = require("@prisma/client");
const { buildAboutPageSections } = require("./about-page-sections-data");

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.pageSection.count({ where: { pageType: "ABOUT" } });
  if (existing > 0) {
    console.log(`Skipping migration — ${existing} ABOUT PageSection row(s) already exist.`);
    return { skipped: true, created: 0, sections: [] };
  }

  const aboutPage = await prisma.aboutPage.findFirst();
  const sections = buildAboutPageSections({
    imageSrc: aboutPage?.imageSrc,
    imageAlt: aboutPage?.imageAlt,
    paragraphs: aboutPage?.paragraphs ?? [],
  });

  const created = [];
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const row = await prisma.pageSection.create({
      data: {
        pageType: "ABOUT",
        sortOrder: i,
        ...section,
      },
    });
    created.push({
      id: row.id,
      sortOrder: row.sortOrder,
      sectionType: row.sectionType,
      title: row.title,
      variant:
        row.payload && typeof row.payload === "object" && "variant" in row.payload
          ? row.payload.variant
          : null,
    });
    console.log(`Created ABOUT section ${i}: ${row.sectionType}${row.title ? ` — ${row.title}` : ""}`);
  }

  console.log(`Migration complete — created ${created.length} ABOUT PageSection row(s).`);
  return { skipped: false, created: created.length, sections: created };
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
