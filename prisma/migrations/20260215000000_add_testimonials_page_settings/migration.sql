-- Add testimonialsPageSettings to SiteConfig
ALTER TABLE "SiteConfig" ADD COLUMN IF NOT EXISTS "testimonialsPageSettings" JSONB;
