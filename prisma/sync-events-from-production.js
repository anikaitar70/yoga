/**
 * Import published events from a public production API into the local database.
 * Matches by slug. Never overwrites existing local events.
 *
 * Run: npm run db:sync-events
 * Optional: EVENTS_SYNC_SOURCE_URL=https://nirvanayoga.org/api/events
 */
const { PrismaClient } = require("@prisma/client");
const { randomUUID } = require("crypto");

const prisma = new PrismaClient();

const DEFAULT_SOURCE = "https://nirvanayoga.org/api/events";
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

function eventDetailNeedsBackfill(value) {
  if (value == null) return true;
  if (typeof value !== "object" || Array.isArray(value)) return true;
  if (!value.enabled) return true;
  const hasSections = Array.isArray(value.sections) && value.sections.length > 0;
  const hasSubtitle = typeof value.subtitle === "string" && value.subtitle.trim().length > 0;
  const registration = value.registration;
  const hasRegistration =
    registration &&
    registration.enabled &&
    typeof registration.googleFormUrl === "string" &&
    registration.googleFormUrl.trim().length > 0;
  return !hasSections && !hasSubtitle && !hasRegistration;
}

async function fetchRemoteEvents(sourceUrl) {
  const response = await fetch(sourceUrl, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch events (${response.status}) from ${sourceUrl}`);
  }
  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Remote events response is not an array.");
  }
  return data;
}

function mapRemoteEvent(remote) {
  const slug = String(remote.slug ?? "").trim();
  if (!slug) return null;

  return {
    title: String(remote.title ?? slug),
    slug,
    description: String(remote.description ?? ""),
    location: String(remote.location ?? ""),
    startsAt: new Date(remote.startsAt),
    endsAt: remote.endsAt ? new Date(remote.endsAt) : null,
    imageUrl: remote.imageUrl ? String(remote.imageUrl) : null,
    imageAlt: remote.imageAlt ? String(remote.imageAlt) : null,
    externalUrl: remote.externalUrl ? String(remote.externalUrl) : null,
    eventDetail: eventDetailNeedsBackfill(remote.eventDetail)
      ? createDefaultEventDetail()
      : remote.eventDetail,
    price: remote.price != null ? Number(remote.price) : null,
    category: String(remote.category ?? "YOGA"),
    isFeatured: Boolean(remote.isFeatured),
    published: Boolean(remote.published ?? true),
    seoTitle: remote.seoTitle ? String(remote.seoTitle) : null,
    metaDescription: remote.metaDescription ? String(remote.metaDescription) : null,
    ogImageUrl: remote.ogImageUrl ? String(remote.ogImageUrl) : null,
    canonicalUrlOverride: remote.canonicalUrlOverride
      ? String(remote.canonicalUrlOverride)
      : null,
    focusKeywords: Array.isArray(remote.focusKeywords)
      ? remote.focusKeywords.map(String)
      : [],
  };
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.error("Refusing to run db:sync-events in production.");
    process.exit(1);
  }

  const sourceUrl = (process.env.EVENTS_SYNC_SOURCE_URL ?? DEFAULT_SOURCE).trim();
  console.log(`Fetching published events from ${sourceUrl}`);

  const remoteEvents = await fetchRemoteEvents(sourceUrl);
  const localEvents = await prisma.event.findMany({
    select: { slug: true },
  });
  const localSlugs = new Set(localEvents.map((event) => event.slug));

  let imported = 0;
  let skippedExisting = 0;
  let skippedInvalid = 0;

  for (const remote of remoteEvents) {
    const mapped = mapRemoteEvent(remote);
    if (!mapped) {
      skippedInvalid += 1;
      continue;
    }
    if (localSlugs.has(mapped.slug)) {
      skippedExisting += 1;
      continue;
    }

    await prisma.event.create({ data: mapped });
    localSlugs.add(mapped.slug);
    imported += 1;
    console.log(`Imported: ${mapped.slug} (${mapped.title})`);
  }

  console.log(
    `Sync complete. Imported ${imported}, skipped existing ${skippedExisting}, invalid ${skippedInvalid}, remote total ${remoteEvents.length}.`,
  );
  console.log("Run npm run db:backfill-event-details to fill panels for any remaining local events.");
}

main()
  .catch((error) => {
    console.error("sync-events-from-production failed:", error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
