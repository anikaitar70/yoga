/**
 * Fix site name and content strings: Nirvan Yoga → Nirvana Yoga
 * Run: node prisma/backfill-brand-name.js
 */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const FROM = /Nirvan Yoga/g;
const TO = "Nirvana Yoga";

function replaceBrandText(value) {
  if (typeof value !== "string" || !value.includes("Nirvan Yoga")) return value;
  return value.replace(FROM, TO);
}

async function main() {
  const configs = await prisma.siteConfig.findMany();
  for (const config of configs) {
    if (config.name?.includes("Nirvan Yoga")) {
      await prisma.siteConfig.update({
        where: { id: config.id },
        data: { name: replaceBrandText(config.name) },
      });
      console.log("Updated SiteConfig name:", config.id);
    }
  }

  const sections = await prisma.pageSection.findMany();
  let sectionUpdates = 0;
  for (const section of sections) {
    const content = replaceBrandText(section.content ?? "");
    const imageAlt = replaceBrandText(section.imageAlt ?? "");
    let payload = section.payload;

    if (payload && typeof payload === "object") {
      payload = JSON.parse(JSON.stringify(payload).replace(FROM, TO));
    }

    const changed =
      content !== (section.content ?? "") ||
      imageAlt !== (section.imageAlt ?? "") ||
      JSON.stringify(payload) !== JSON.stringify(section.payload);

    if (changed) {
      await prisma.pageSection.update({
        where: { id: section.id },
        data: {
          content: content || section.content,
          imageAlt: imageAlt || section.imageAlt,
          payload,
        },
      });
      sectionUpdates += 1;
      console.log("Updated section:", section.pageType, section.title);
    }
  }

  console.log(`Done. Page sections updated: ${sectionUpdates}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
