/**
 * Backfill editable Read More panels for events missing eventDetail.
 * Run: node prisma/backfill-event-details.js
 */
const { PrismaClient } = require("@prisma/client");
const { randomUUID } = require("crypto");

const prisma = new PrismaClient();

const PLACEHOLDER =
  "Event details are being prepared. Please update this section from the Event CMS.";

function createDefaultEventDetail() {
  return {
    enabled: true,
    subtitle: "",
    sections: [
      {
        id: randomUUID(),
        type: "TEXT",
        title: "About this event",
        paragraphs: [PLACEHOLDER],
      },
    ],
    registration: {
      enabled: false,
      label: "Register for this Event",
      googleFormUrl: "",
    },
  };
}

function parseEventDetail(value) {
  if (value == null) return null;
  if (typeof value !== "object" || Array.isArray(value)) return null;
  const detail = value;
  if (!detail.enabled) return detail;
  const hasSections = Array.isArray(detail.sections) && detail.sections.length > 0;
  const hasSubtitle = typeof detail.subtitle === "string" && detail.subtitle.trim().length > 0;
  const registration = detail.registration;
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
    console.error("backfill-event-details failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
