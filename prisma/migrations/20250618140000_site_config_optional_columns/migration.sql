-- Backfill SiteConfig columns for databases created before the full init baseline.
ALTER TABLE "SiteConfig" ADD COLUMN IF NOT EXISTS "branding" JSONB;
ALTER TABLE "SiteConfig" ADD COLUMN IF NOT EXISTS "navigation" JSONB;
ALTER TABLE "SiteConfig" ADD COLUMN IF NOT EXISTS "homepageLayout" JSONB;
ALTER TABLE "SiteConfig" ADD COLUMN IF NOT EXISTS "homepageSections" JSONB;
ALTER TABLE "SiteConfig" ADD COLUMN IF NOT EXISTS "timelineStyleDefaults" JSONB;
ALTER TABLE "SiteConfig" ADD COLUMN IF NOT EXISTS "timelineStyleByPage" JSONB;
