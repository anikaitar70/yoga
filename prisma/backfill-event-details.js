/**
 * Backfill editable Read More panels for events missing eventDetail.
 * Run: node prisma/backfill-event-details.js
 */
const { PrismaClient } = require("@prisma/client");
const { randomUUID } = require("crypto");

const prisma = new PrismaClient();

const PLACEHOLDER_EN =
  "Event details are being prepared. Please update this section from the Event CMS.";
const PLACEHOLDER_JA =
  "イベントの詳細を準備中です。イベント管理画面から内容を更新してください。";

function createDefaultEventDetail() {
  return {
    enabled: true,
    en: {
      subtitle: "",
      sections: [
        {
          id: randomUUID(),
          type: "TEXT",
          title: "About this event",
          paragraphs: [PLACEHOLDER_EN],
        },
      ],
      registration: {
        enabled: false,
        label: "Register for this Event",
        googleFormUrl: "",
      },
    },
    ja: {
      subtitle: "",
      sections: [
        {
          id: randomUUID(),
          type: "TEXT",
          title: "このイベントについて",
          paragraphs: [PLACEHOLDER_JA],
        },
      ],
      registration: {
        enabled: false,
        label: "このイベントに登録する",
        googleFormUrl: "",
      },
    },
  };
}

function migrateLegacyDetail(detail) {
  if (detail && detail.en) return detail;
  return {
    enabled: Boolean(detail?.enabled),
    en: {
      subtitle: detail?.subtitle ?? "",
      sections: Array.isArray(detail?.sections) ? detail.sections : [],
      registration: detail?.registration ?? {
        enabled: false,
        label: "Register for this Event",
        googleFormUrl: "",
      },
    },
  };
}

function parseEventDetail(value) {
  if (value == null) return null;
  if (typeof value !== "object" || Array.isArray(value)) return null;
  const detail = migrateLegacyDetail(value);
  if (!detail.enabled) return detail;
  const en = detail.en;
  const hasSections = Array.isArray(en.sections) && en.sections.length > 0;
  const hasSubtitle = typeof en.subtitle === "string" && en.subtitle.trim().length > 0;
  const registration = en.registration;
  const hasRegistration =
    registration &&
    registration.enabled &&
    typeof registration.googleFormUrl === "string" &&
    registration.googleFormUrl.trim().length > 0;
  if (!hasSections && !hasSubtitle && !hasRegistration) return null;
  return detail;
}

function needsBackfill(eventDetail) {
  const parsed = parseEventDetail(eventDetail);
  if (!parsed) return true;
  if (!parsed.enabled) return true;
  return false;
}

async function main() {
  const events = await prisma.event.findMany({
    orderBy: { startsAt: "asc" },
    select: { id: true, slug: true, title: true, eventDetail: true },
  });

  let updated = 0;
  let skipped = 0;

  for (const event of events) {
    if (!needsBackfill(event.eventDetail)) {
      skipped += 1;
      continue;
    }

    await prisma.event.update({
      where: { id: event.id },
      data: { eventDetail: createDefaultEventDetail() },
    });
    updated += 1;
    console.log(`Backfilled eventDetail: ${event.slug} (${event.title})`);
  }

  console.log(`Done. Updated ${updated}, skipped ${skipped}, total ${events.length}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
