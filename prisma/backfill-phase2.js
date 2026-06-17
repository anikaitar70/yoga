/**
 * Phase 2 backfill:
 * - HERO sections: tagline + CTA payload defaults
 * - Art timeline sections with manual items: set timeline.mode = "manual"
 *
 * Run: node prisma/backfill-phase2.js
 */
const { PrismaClient } = require("@prisma/client");
const { HERO_PAYLOAD_BY_PAGE } = require("./hero-payload-defaults");

const prisma = new PrismaClient();

function timelineHasManualItems(timeline) {
  if (!timeline || typeof timeline !== "object") return false;
  const items = timeline.items;
  if (!Array.isArray(items) || items.length === 0) return false;
  return items.some((item) => typeof item?.text === "string" && item.text.trim().length > 0);
}

async function main() {
  const sections = await prisma.pageSection.findMany();
  let heroUpdated = 0;
  let timelineUpdated = 0;

  for (const section of sections) {
    let payload =
      section.payload && typeof section.payload === "object" ? { ...section.payload } : null;
    let changed = false;

    if (section.sectionType === "HERO") {
      const defaults = HERO_PAYLOAD_BY_PAGE[section.pageType];
      if (defaults) {
        const existing = payload ?? {};
        const merged = {
          ...defaults,
          ...existing,
          primaryCta: { ...defaults.primaryCta, ...(existing.primaryCta ?? {}) },
          secondaryCta: { ...defaults.secondaryCta, ...(existing.secondaryCta ?? {}) },
        };
        payload = merged;
        changed = true;
        heroUpdated += 1;
        console.log(`HERO backfill: ${section.pageType} — ${section.title ?? section.id}`);
      }
    }

    if (section.sectionType === "CUSTOM_TEXT" && payload?.timeline && timelineHasManualItems(payload.timeline)) {
      if (payload.timeline.mode !== "manual") {
        payload = {
          ...payload,
          timeline: {
            ...payload.timeline,
            mode: "manual",
          },
        };
        changed = true;
        timelineUpdated += 1;
        console.log(`Timeline manual mode: ${section.pageType} — ${section.title ?? section.id}`);
      }
    }

    if (changed) {
      await prisma.pageSection.update({
        where: { id: section.id },
        data: { payload },
      });
    }
  }

  console.log(`Done. HERO rows updated: ${heroUpdated}. Timeline mode rows updated: ${timelineUpdated}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
