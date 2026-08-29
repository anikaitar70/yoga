import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  parseTestimonialsPageSettings,
  type TestimonialsPageSettings,
} from "@/lib/testimonials-page-settings";
import { SITE_CONFIG_ID } from "@/lib/site-config-store";

function isFieldError(error: unknown, field: string): boolean {
  return (
    (error instanceof Prisma.PrismaClientValidationError && error.message.includes(field)) ||
    (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2022" && (error.meta as { column?: string })?.column === field)
  );
}

export async function readTestimonialsPageSettings(): Promise<TestimonialsPageSettings> {
  try {
    const row = await prisma.siteConfig.findUnique({
      where: { id: SITE_CONFIG_ID },
      select: { testimonialsPageSettings: true },
    });
    return parseTestimonialsPageSettings(row?.testimonialsPageSettings);
  } catch (error) {
    if (!isFieldError(error, "testimonialsPageSettings")) throw error;
  }

  try {
    const rows = await prisma.$queryRaw<Array<{ testimonialsPageSettings: unknown }>>`
      SELECT "testimonialsPageSettings" FROM "SiteConfig" WHERE id = ${SITE_CONFIG_ID} LIMIT 1
    `;
    return parseTestimonialsPageSettings(rows[0]?.testimonialsPageSettings);
  } catch {
    return parseTestimonialsPageSettings(null);
  }
}

export async function writeTestimonialsPageSettings(settings: TestimonialsPageSettings): Promise<TestimonialsPageSettings> {
  const parsed = parseTestimonialsPageSettings(settings);
  try {
    const updated = await prisma.siteConfig.update({
      where: { id: SITE_CONFIG_ID },
      data: { testimonialsPageSettings: parsed },
      select: { testimonialsPageSettings: true },
    });
    return parseTestimonialsPageSettings(updated.testimonialsPageSettings);
  } catch (error) {
    if (!isFieldError(error, "testimonialsPageSettings")) throw error;
  }

  await prisma.$executeRaw`
    UPDATE "SiteConfig"
    SET "testimonialsPageSettings" = ${JSON.stringify(parsed)}::jsonb, "updatedAt" = NOW()
    WHERE id = ${SITE_CONFIG_ID}
  `;
  return parsed;
}
