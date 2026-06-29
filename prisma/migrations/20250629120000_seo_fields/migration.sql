-- CreateEnum
CREATE TYPE "TranslationReviewStatus" AS ENUM ('MACHINE', 'HUMAN_REVIEWED');

-- AlterTable BlogPost
ALTER TABLE "BlogPost" ADD COLUMN "coverImageAlt" TEXT;
ALTER TABLE "BlogPost" ADD COLUMN "seoTitle" TEXT;
ALTER TABLE "BlogPost" ADD COLUMN "metaDescription" TEXT;
ALTER TABLE "BlogPost" ADD COLUMN "ogImageUrl" TEXT;
ALTER TABLE "BlogPost" ADD COLUMN "canonicalUrlOverride" TEXT;
ALTER TABLE "BlogPost" ADD COLUMN "focusKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "BlogPost" ADD COLUMN "jaTranslationStatus" "TranslationReviewStatus" NOT NULL DEFAULT 'MACHINE';

-- AlterTable Event
ALTER TABLE "Event" ADD COLUMN "imageAlt" TEXT;
ALTER TABLE "Event" ADD COLUMN "seoTitle" TEXT;
ALTER TABLE "Event" ADD COLUMN "metaDescription" TEXT;
ALTER TABLE "Event" ADD COLUMN "ogImageUrl" TEXT;
ALTER TABLE "Event" ADD COLUMN "canonicalUrlOverride" TEXT;
ALTER TABLE "Event" ADD COLUMN "focusKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Event" ADD COLUMN "jaTranslationStatus" "TranslationReviewStatus" NOT NULL DEFAULT 'MACHINE';

-- CreateTable PageSeo
CREATE TABLE "PageSeo" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "seoTitle" TEXT,
    "metaDescription" TEXT,
    "ogImageUrl" TEXT,
    "canonicalUrlOverride" TEXT,
    "focusKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "jaTranslationStatus" "TranslationReviewStatus" NOT NULL DEFAULT 'MACHINE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageSeo_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PageSeo_path_key" ON "PageSeo"("path");
