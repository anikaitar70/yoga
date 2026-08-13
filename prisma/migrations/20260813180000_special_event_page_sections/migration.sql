-- CreateEnum
CREATE TYPE "SpecialEventTocMode" AS ENUM ('AUTOMATIC', 'CUSTOM');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "isSpecialEvent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "specialEventTocMode" "SpecialEventTocMode" NOT NULL DEFAULT 'AUTOMATIC',
ADD COLUMN     "specialEventTocOverride" JSONB;

-- CreateTable
CREATE TABLE "EventPageSection" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "sectionType" "PageSectionType" NOT NULL,
    "anchorSlug" TEXT NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "content" TEXT,
    "imageUrl" TEXT,
    "imageAlt" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "layout" JSONB,
    "payload" JSONB,
    "jaLocale" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventPageSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventPageSection_eventId_sortOrder_idx" ON "EventPageSection"("eventId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "EventPageSection_eventId_anchorSlug_key" ON "EventPageSection"("eventId", "anchorSlug");

-- AddForeignKey
ALTER TABLE "EventPageSection" ADD CONSTRAINT "EventPageSection_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
