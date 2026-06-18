/**
 * Ensures a single SiteConfig row with id "main".
 * Fixes VPS installs where seed + CMS created duplicate rows and branding appeared to revert.
 */
const { PrismaClient } = require("@prisma/client");

const SITE_CONFIG_ID = "main";
const prisma = new PrismaClient();

function hasUploadedBranding(branding) {
  if (!branding || typeof branding !== "object") return false;
  for (const key of ["nirvanaYoga", "justArtAffaire"]) {
    const entry = branding[key];
    if (
      entry &&
      typeof entry === "object" &&
      typeof entry.logoSrc === "string" &&
      entry.logoSrc.startsWith("/uploads/")
    ) {
      return true;
    }
  }
  return false;
}

async function main() {
  const rows = await prisma.siteConfig.findMany({ orderBy: { updatedAt: "desc" } });
  if (rows.length === 0) {
    console.log("consolidate-site-config: no SiteConfig rows");
    return;
  }

  if (rows.length === 1 && rows[0].id === SITE_CONFIG_ID) {
    console.log("consolidate-site-config: already canonical");
    return;
  }

  const withUploads = rows.find((row) => hasUploadedBranding(row.branding));
  const source = withUploads ?? rows[0];

  const { id, createdAt, updatedAt, ...data } = source;

  await prisma.siteConfig.upsert({
    where: { id: SITE_CONFIG_ID },
    create: { id: SITE_CONFIG_ID, ...data },
    update: data,
  });

  const deleted = await prisma.siteConfig.deleteMany({
    where: { id: { not: SITE_CONFIG_ID } },
  });

  console.log(
    `consolidate-site-config: merged into ${SITE_CONFIG_ID}, removed ${deleted.count} duplicate row(s)`,
  );
}

main()
  .catch((error) => {
    console.error("consolidate-site-config failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
