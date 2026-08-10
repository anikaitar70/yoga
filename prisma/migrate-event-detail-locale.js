/**
 * Convert legacy flat eventDetail JSON to bilingual { en, ja } storage.
 * Run: node prisma/migrate-event-detail-locale.js
 */
const { PrismaClient } = require("@prisma/client");
const { randomUUID } = require("crypto");

const prisma = new PrismaClient();

const DEFAULT_REGISTRATION_EN = {
  enabled: false,
  label: "Register for this Event",
  googleFormUrl: "",
};

const DEFAULT_REGISTRATION_JA = {
  enabled: false,
  label: "このイベントに登録する",
  googleFormUrl: "",
};

function scaffoldJaFromEn(en) {
  return {
    subtitle: "",
    sections: (en.sections ?? []).map((section) => {
      if (section.type === "TEXT") {
        return { id: randomUUID(), type: "TEXT", title: "", paragraphs: [""] };
      }
      if (section.type === "IMAGE") {
        return { ...section };
      }
      return {
        id: randomUUID(),
        type: "IMAGE_TEXT",
        title: "",
        imageUrl: section.imageUrl,
        imageAlt: section.imageAlt,
        paragraphs: [""],
        imagePosition: section.imagePosition ?? "left",
      };
    }),
    registration: {
      enabled: Boolean(en.registration?.enabled),
      label: DEFAULT_REGISTRATION_JA.label,
      googleFormUrl: en.registration?.googleFormUrl ?? "",
    },
  };
}

function toLocalized(detail) {
  if (!detail || typeof detail !== "object") return null;
  if (detail.en) {
    return {
      enabled: Boolean(detail.enabled),
      en: {
        subtitle: detail.en.subtitle ?? "",
        sections: detail.en.sections ?? [],
        registration: detail.en.registration ?? { ...DEFAULT_REGISTRATION_EN },
      },
      ja: detail.ja
        ? {
            subtitle: detail.ja.subtitle ?? "",
            sections: detail.ja.sections ?? [],
            registration: detail.ja.registration ?? { ...DEFAULT_REGISTRATION_JA },
          }
        : scaffoldJaFromEn(detail.en),
    };
  }

  const en = {
    subtitle: detail.subtitle ?? "",
    sections: Array.isArray(detail.sections) ? detail.sections : [],
    registration: detail.registration ?? { ...DEFAULT_REGISTRATION_EN },
  };

  return {
    enabled: Boolean(detail.enabled),
    en,
    ja: scaffoldJaFromEn(en),
  };
}

async function main() {
  const events = await prisma.event.findMany({
    select: { id: true, slug: true, title: true, eventDetail: true },
  });

  let updated = 0;
  for (const event of events) {
    const localized = toLocalized(event.eventDetail);
    if (!localized) continue;
    const needsUpdate = !event.eventDetail?.en;
    if (!needsUpdate) continue;

    await prisma.event.update({
      where: { id: event.id },
      data: { eventDetail: localized },
    });
    updated += 1;
    console.log(`Migrated: ${event.slug}`);
  }

  console.log(`Done. Migrated ${updated} of ${events.length} events.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
