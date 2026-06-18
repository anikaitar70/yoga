import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin-session";
import { jaaLogoFromParsed, jaaLogoFromUnknown } from "@/lib/branding-diagnostics";
import { SITE_CONFIG_ID } from "@/lib/site-config-store";

/** Admin-only snapshot of SiteConfig branding rows — for VPS debugging. */
export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const rows = await prisma.siteConfig.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      updatedAt: true,
      branding: true,
    },
  });

  return NextResponse.json({
    canonicalId: SITE_CONFIG_ID,
    rowCount: rows.length,
    rows: rows.map((row) => ({
      id: row.id,
      isCanonical: row.id === SITE_CONFIG_ID,
      updatedAt: row.updatedAt,
      rawJustArtLogoSrc: jaaLogoFromUnknown(row.branding),
      parsedJustArtLogoSrc: jaaLogoFromParsed(row.branding),
    })),
  });
}
