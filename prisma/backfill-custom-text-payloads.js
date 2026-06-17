/**
 * Backfill timeline + highlight flags on existing CUSTOM_TEXT journey sections.
 * Run: node prisma/backfill-custom-text-payloads.js
 */
const { PrismaClient } = require("@prisma/client");
const { JUST_ART_PAGE_SECTIONS } = require("./just-art-page-sections-data");
const { HEALING_PAGE_SECTIONS } = require("./healing-page-sections-data");
const { YOGA_PAGE_SECTIONS } = require("./yoga-page-sections-data");

const prisma = new PrismaClient();

const journeyPayloadByTitle = new Map();

for (const sections of [JUST_ART_PAGE_SECTIONS, HEALING_PAGE_SECTIONS, YOGA_PAGE_SECTIONS]) {
  for (const section of sections) {
    if (section.sectionType === "CUSTOM_TEXT" && section.payload?.variant) {
      journeyPayloadByTitle.set(`${section.title}::${section.payload.variant}`, section.payload);
    }
  }
}

async function main() {
  const sections = await prisma.pageSection.findMany({
    where: { sectionType: "CUSTOM_TEXT" },
  });

  for (const section of sections) {
    const payload = section.payload && typeof section.payload === "object" ? { ...section.payload } : {};
    const key = `${section.title ?? ""}::${payload.variant ?? ""}`;
    const template = journeyPayloadByTitle.get(key);

    if (template) {
      Object.assign(payload, {
        highlightsEnabled: template.highlightsEnabled ?? payload.highlightsEnabled,
        highlights: template.highlights ?? payload.highlights,
        timeline: template.timeline ?? payload.timeline,
        sutraEnabled: template.sutraEnabled ?? payload.sutraEnabled,
        sutra: template.sutra ?? payload.sutra,
      });
    }

    await prisma.pageSection.update({
      where: { id: section.id },
      data: { payload },
    });
    console.log(`Updated CUSTOM_TEXT: ${section.pageType} — ${section.title}`);
  }

  console.log("Done.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
