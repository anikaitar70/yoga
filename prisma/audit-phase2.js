/**
 * Phase 2 verification audit (read-only).
 * Run: node prisma/audit-phase2.js
 */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const sections = await prisma.pageSection.findMany({ orderBy: [{ pageType: "asc" }, { sortOrder: "asc" }] });

  const byType = {};
  for (const s of sections) {
    byType[s.sectionType] = (byType[s.sectionType] ?? 0) + 1;
  }

  const heroes = sections.filter((s) => s.sectionType === "HERO");
  const heroesWithPayload = heroes.filter(
    (s) => s.payload && typeof s.payload === "object" && s.payload.tagline,
  );

  const galleries = sections.filter((s) => s.sectionType === "GALLERY");
  const immersiveGalleries = galleries.filter(
    (s) => s.layout && typeof s.layout === "object" && s.layout.galleryStyle === "immersive",
  );

  const customText = sections.filter((s) => s.sectionType === "CUSTOM_TEXT");
  const contentCleared = customText.filter((s) => s.content === null || s.content === "");
  const paragraphsOnly = customText.filter(
    (s) =>
      s.payload &&
      typeof s.payload === "object" &&
      Array.isArray(s.payload.paragraphs) &&
      s.payload.paragraphs.length > 0,
  );

  const timelines = customText.filter(
    (s) => s.payload && typeof s.payload === "object" && s.payload.timeline,
  );
  const manualTimelines = timelines.filter(
    (s) => s.payload.timeline.mode === "manual" && (s.payload.timeline.items?.length ?? 0) > 0,
  );

  const invalidVariants = customText.filter((s) => {
    const variant = s.payload?.variant ?? "default";
    const allowed = {
      YOGA: ["default", "yoga-journey"],
      HEALING: ["default", "healing-journey"],
      JUST_ART_LIFE: ["default", "art-journey"],
    }[s.pageType];
    return !allowed.includes(variant);
  });

  console.log("=== Phase 2 audit ===");
  console.log("Total PageSection rows:", sections.length);
  console.log("By type:", byType);
  console.log("HERO with tagline payload:", heroesWithPayload.length, "/", heroes.length);
  console.log("GALLERY with immersive layout:", immersiveGalleries.length);
  console.log("CUSTOM_TEXT with paragraphs:", paragraphsOnly.length, "/", customText.length);
  console.log("CUSTOM_TEXT with empty content field:", contentCleared.length);
  console.log("Timelines with manual mode + items:", manualTimelines.length);
  console.log("Invalid CUSTOM_TEXT variants:", invalidVariants.length);

  if (invalidVariants.length) {
    for (const s of invalidVariants) {
      console.log("  INVALID:", s.pageType, s.title, s.payload?.variant);
    }
  }

  const artTimeline = sections.find(
    (s) => s.pageType === "JUST_ART_LIFE" && s.title === "How it began",
  );
  if (artTimeline) {
    console.log("\nArt timeline section:");
    console.log("  mode:", artTimeline.payload?.timeline?.mode);
    console.log("  items:", artTimeline.payload?.timeline?.items?.length ?? 0);
    console.log("  content length:", (artTimeline.content ?? "").length);
    console.log("  paragraphs:", artTimeline.payload?.paragraphs?.length ?? 0);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
