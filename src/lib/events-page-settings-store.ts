import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseEventsPageSettings, type EventsPageSettings } from "@/lib/events-page-settings";
import { SITE_CONFIG_ID } from "@/lib/site-config-store";

function isEventsPageSettingsFieldError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientValidationError &&
    error.message.includes("eventsPageSettings")
  );
}

/** Read events page settings — falls back to SQL when Prisma client is not yet regenerated. */
export async function readEventsPageSettings(): Promise<EventsPageSettings> {
  try {
    const row = await prisma.siteConfig.findUnique({
      where: { id: SITE_CONFIG_ID },
      select: { eventsPageSettings: true },
    });
    return parseEventsPageSettings(row?.eventsPageSettings);
  } catch (error) {
    if (!isEventsPageSettingsFieldError(error)) {
      throw error;
    }
  }

  try {
    const rows = await prisma.$queryRaw<Array<{ eventsPageSettings: unknown }>>`
      SELECT "eventsPageSettings" FROM "SiteConfig" WHERE id = ${SITE_CONFIG_ID} LIMIT 1
    `;
    return parseEventsPageSettings(rows[0]?.eventsPageSettings);
  } catch {
    return parseEventsPageSettings(null);
  }
}

/** Persist events page settings — falls back to SQL when Prisma client is not yet regenerated. */
export async function writeEventsPageSettings(settings: EventsPageSettings): Promise<EventsPageSettings> {
  try {
    const updated = await prisma.siteConfig.update({
      where: { id: SITE_CONFIG_ID },
      data: { eventsPageSettings: settings },
      select: { eventsPageSettings: true },
    });
    return parseEventsPageSettings(updated.eventsPageSettings);
  } catch (error) {
    if (!isEventsPageSettingsFieldError(error)) {
      throw error;
    }
  }

  await prisma.$executeRaw`
    UPDATE "SiteConfig"
    SET "eventsPageSettings" = ${JSON.stringify(settings)}::jsonb, "updatedAt" = NOW()
    WHERE id = ${SITE_CONFIG_ID}
  `;
  return settings;
}
