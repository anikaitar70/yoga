/**
 * Upsert featured studio events (weekly sessions, workshops, retreats, training).
 * Run: node prisma/seed-featured-events.js
 */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const featuredEvents = [
  {
    title: "Yoga Nidra (Japanese) — Weekly",
    slug: "yoga-nidra-japanese-wednesday",
    description:
      "Weekly Yoga Nidra session in Japanese. Every Wednesday, 1:30 pm at the local studio — deep relaxation and conscious rest.",
    location: "Local studio",
    startsAt: new Date("2026-06-10T04:30:00.000Z"),
    endsAt: new Date("2026-06-10T05:30:00.000Z"),
    category: "YOGA_NIDRA",
    isFeatured: true,
    published: true,
  },
  {
    title: "Yoga Session (English) — Thursday 10–11 am JST",
    slug: "yoga-session-thursday-10am",
    description:
      "Weekly yoga session every Thursday, 10:00–11:00 am JST. English — available online and offline.",
    location: "Online & offline",
    startsAt: new Date("2026-06-11T01:00:00.000Z"),
    endsAt: new Date("2026-06-11T02:00:00.000Z"),
    category: "YOGA",
    isFeatured: true,
    published: true,
  },
  {
    title: "Yoga Session (English) — Thursday 7–8 am JST",
    slug: "yoga-session-thursday-7am",
    description:
      "Weekly yoga session every Thursday, 7:00–8:00 am JST. English — available online and offline.",
    location: "Online & offline",
    startsAt: new Date("2026-06-11T22:00:00.000Z"),
    endsAt: new Date("2026-06-11T23:00:00.000Z"),
    category: "YOGA",
    isFeatured: true,
    published: true,
  },
  {
    title: "Yoga Nidra & Ayurveda Cooking",
    slug: "yoga-nidra-ayurveda-cooking-hiroshima",
    description:
      "A two-day workshop weaving Yoga Nidra with Ayurveda cooking in Hiroshima, Japan — 30 & 31 May 2026.",
    location: "Hiroshima, Japan",
    startsAt: new Date("2026-05-30T00:00:00.000Z"),
    endsAt: new Date("2026-05-31T14:00:00.000Z"),
    category: "WORKSHOP",
    isFeatured: true,
    published: true,
  },
  {
    title: "India Retreat",
    slug: "india-retreat-tbd",
    description:
      "Retreat in India — yoga, pranayama, meditation, Yoga Nidra, and Ayurveda therapies. Dates TBD.",
    location: "India",
    startsAt: new Date("2026-11-01T00:00:00.000Z"),
    endsAt: null,
    category: "RETREAT",
    isFeatured: true,
    published: true,
  },
  {
    title: "Yoga Nidra Teachers Training Course",
    slug: "yoga-nidra-tt-july",
    description:
      "11-hour Yoga Nidra Teachers Training Course — available in English & Japanese. Japanese sessions on 8 & 15 July at the local studio (online and offline). For the English online course, please email us.",
    location: "Local studio — online & offline",
    startsAt: new Date("2026-07-08T01:00:00.000Z"),
    endsAt: new Date("2026-07-15T10:00:00.000Z"),
    category: "TEACHER_TRAINING",
    isFeatured: true,
    published: true,
  },
  {
    title: "Yoga Sutra & Philosophy Sessions",
    slug: "yoga-sutra-philosophy-august",
    description:
      "8-hour course in English exploring Patanjali's Yoga Sutras — sessions on 18 & 25 August.",
    location: "Online",
    startsAt: new Date("2026-08-18T01:00:00.000Z"),
    endsAt: new Date("2026-08-25T10:00:00.000Z"),
    category: "PHILOSOPHY",
    isFeatured: true,
    published: true,
  },
];

async function main() {
  for (const event of featuredEvents) {
    const { slug, ...data } = event;
    await prisma.event.upsert({
      where: { slug },
      update: data,
      create: { slug, ...data },
    });
    console.log(`Upserted: ${slug}`);
  }

  // Retire duplicate slug from older seed if present
  const legacy = await prisma.event.findUnique({
    where: { slug: "yoga-session-thursday-morning" },
  });
  if (legacy) {
    await prisma.event.update({
      where: { slug: "yoga-session-thursday-morning" },
      data: { published: false, isFeatured: false },
    });
    console.log("Archived legacy slug: yoga-session-thursday-morning");
  }

  const legacyTt = await prisma.event.findUnique({
    where: { slug: "yoga-nidra-tt-japanese-july" },
  });
  if (legacyTt && legacyTt.slug !== "yoga-nidra-tt-july") {
    await prisma.event.update({
      where: { slug: "yoga-nidra-tt-japanese-july" },
      data: { published: false, isFeatured: false },
    });
    console.log("Archived legacy slug: yoga-nidra-tt-japanese-july");
  }

  console.log(`Done — ${featuredEvents.length} featured events upserted.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
