-- Add dedicated hero image for special events (separate from card image)
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "heroImageUrl" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "heroImageAlt" TEXT;
