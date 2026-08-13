-- Events page display limits (SiteConfig) and Special Event page CTA fields (Event)
ALTER TABLE "SiteConfig" ADD COLUMN IF NOT EXISTS "eventsPageSettings" JSONB;

ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "specialEventCtaLabel" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "specialEventCtaUrl" TEXT;
