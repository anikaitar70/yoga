const { PrismaClient } = require("@prisma/client");

const PENDING = [
  "20250623120000_admin_sessions",
  "20250624120000_site_config_locale_content",
  "20250629120000_seo_fields",
  "20260811000000_event_detail_external_url",
  "20260811120000_event_sort_order_external_label",
  "20260811130000_blog_ja_locale",
  "20260811140000_entity_ja_locale",
  "20260813180000_special_event_page_sections",
];

async function columnExists(prisma, table, column) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
    table,
    column,
  );
  return rows.length > 0;
}

async function tableExists(prisma, table) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = $1`,
    table,
  );
  return rows.length > 0;
}

async function typeExists(prisma, typeName) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT 1 FROM pg_type WHERE typname = $1`,
    typeName,
  );
  return rows.length > 0;
}

async function migrationAlreadyApplied(prisma, name) {
  switch (name) {
    case "20250623120000_admin_sessions":
      return tableExists(prisma, "AdminSession");
    case "20250624120000_site_config_locale_content":
      return columnExists(prisma, "SiteConfig", "localeContent");
    case "20250629120000_seo_fields":
      return (
        (await tableExists(prisma, "PageSeo")) &&
        (await columnExists(prisma, "Event", "seoTitle")) &&
        (await typeExists(prisma, "TranslationReviewStatus"))
      );
    case "20260811000000_event_detail_external_url":
      return (
        (await columnExists(prisma, "Event", "eventDetail")) &&
        (await columnExists(prisma, "Event", "externalUrl"))
      );
    case "20260811120000_event_sort_order_external_label":
      return (
        (await columnExists(prisma, "Event", "sortOrder")) &&
        (await columnExists(prisma, "Event", "externalLinkLabel"))
      );
    case "20260811130000_blog_ja_locale":
      return columnExists(prisma, "BlogPost", "jaLocale");
    case "20260811140000_entity_ja_locale":
      return columnExists(prisma, "Event", "jaLocale");
    case "20260813180000_special_event_page_sections":
      return (
        (await tableExists(prisma, "EventPageSection")) &&
        (await columnExists(prisma, "Event", "isSpecialEvent")) &&
        (await typeExists(prisma, "SpecialEventTocMode"))
      );
    default:
      return false;
  }
}

async function main() {
  const prisma = new PrismaClient();
  try {
    for (const migration of PENDING) {
      const applied = await migrationAlreadyApplied(prisma, migration);
      console.log(`${migration}: ${applied ? "ALREADY IN DB" : "NEEDS APPLY"}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
