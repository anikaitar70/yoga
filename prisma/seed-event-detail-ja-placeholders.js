/**
 * Seed Japanese placeholder text for events that still have empty ja sections.
 * Run: node prisma/seed-event-detail-ja-placeholders.js
 */
const { PrismaClient } = require("@prisma/client");
const { randomUUID } = require("crypto");

const prisma = new PrismaClient();

const DEFAULT_PANEL_PLACEHOLDER_EN =
  "Event details are being prepared. Please update this section from the Event CMS.";
const DEFAULT_SECTION_TITLE_EN = "About this event";
const DEFAULT_PANEL_PLACEHOLDER_JA =
  "イベントの詳細を準備中です。イベント管理画面から内容を更新してください。";
const DEFAULT_SECTION_TITLE_JA = "このイベントについて";

function isDefaultEnglishPlaceholder(en) {
  if (en.subtitle?.trim()) return false;
  if (!Array.isArray(en.sections) || en.sections.length !== 1) return false;
  const section = en.sections[0];
  if (section.type !== "TEXT") return false;
  const title = section.title?.trim() ?? "";
  if (title && title !== DEFAULT_SECTION_TITLE_EN) return false;
  const paragraphs = section.paragraphs.map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length !== 1) return false;
  return paragraphs[0] === DEFAULT_PANEL_PLACEHOLDER_EN;
}

function sectionHasReadableContent(section) {
  if (section.type === "TEXT") {
    return section.paragraphs.some((p) => p.trim()) || Boolean(section.title?.trim());
  }
  if (section.type === "IMAGE") return Boolean(section.imageUrl?.trim());
  if (section.type === "IMAGE_TEXT") {
    return (
      Boolean(section.imageUrl?.trim()) ||
      section.paragraphs.some((p) => p.trim()) ||
      Boolean(section.title?.trim())
    );
  }
  return false;
}

function localeContentHasReadableBody(content) {
  if (!content) return false;
  if (Array.isArray(content.sections) && content.sections.some(sectionHasReadableContent)) return true;
  if (content.subtitle?.trim()) return true;
  return false;
}

function buildDefaultJapanesePlaceholder(en) {
  return {
    subtitle: "",
    sections: [
      {
        id: randomUUID(),
        type: "TEXT",
        title: DEFAULT_SECTION_TITLE_JA,
        paragraphs: [DEFAULT_PANEL_PLACEHOLDER_JA],
      },
    ],
    registration: {
      enabled: Boolean(en.registration?.enabled),
      label: "このイベントに登録する",
      googleFormUrl: en.registration?.googleFormUrl ?? "",
    },
  };
}

async function main() {
  const events = await prisma.event.findMany({
    select: { id: true, slug: true, title: true, eventDetail: true },
  });

  let updated = 0;
  for (const event of events) {
    const detail = event.eventDetail;
    if (!detail?.en || !detail.enabled) continue;
    if (!isDefaultEnglishPlaceholder(detail.en)) continue;
    if (localeContentHasReadableBody(detail.ja)) continue;

    const ja = buildDefaultJapanesePlaceholder(detail.en);
    await prisma.event.update({
      where: { id: event.id },
      data: { eventDetail: { ...detail, ja } },
    });
    updated += 1;
    console.log(`Seeded JA placeholder: ${event.slug}`);
  }

  console.log(`Done. Updated ${updated} events.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
