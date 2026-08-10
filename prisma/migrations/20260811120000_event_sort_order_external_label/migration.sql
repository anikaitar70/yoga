-- AlterTable
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "externalLinkLabel" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- Preserve existing chronological order as the initial manual order.
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "startsAt" ASC, "createdAt" ASC) - 1 AS next_order
  FROM "Event"
)
UPDATE "Event" AS e
SET "sortOrder" = ranked.next_order
FROM ranked
WHERE e.id = ranked.id;
