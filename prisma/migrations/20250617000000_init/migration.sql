-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('YOGA', 'HEALING', 'JUST_ART_LIFE', 'RETREATS_AND_TOURS', 'RETREAT', 'WORKSHOP', 'TEACHER_TRAINING', 'PHILOSOPHY', 'YOGA_NIDRA');

-- CreateEnum
CREATE TYPE "TestimonialStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TestimonialSourceType" AS ENUM ('TEXT', 'IMAGE', 'OCR');

-- CreateEnum
CREATE TYPE "TestimonialDisplayStyle" AS ENUM ('CARD', 'HANDWRITTEN');

-- CreateEnum
CREATE TYPE "PageType" AS ENUM ('YOGA', 'HEALING', 'JUST_ART_LIFE', 'ABOUT');

-- CreateEnum
CREATE TYPE "PageSectionType" AS ENUM ('HERO', 'IMAGE_TEXT', 'GALLERY', 'TESTIMONIALS', 'EVENTS', 'CONTACT', 'CUSTOM_TEXT');

-- CreateEnum
CREATE TYPE "PreferredContactMethod" AS ENUM ('WHATSAPP', 'CALL', 'SMS', 'EMAIL', 'LINE', 'TELEGRAM', 'OTHER');

-- CreateEnum
CREATE TYPE "GalleryCategory" AS ENUM ('ART', 'YOGA_NIDRA', 'EVENTS', 'RETREATS', 'HEALING', 'JAPAN_EVENTS');

-- CreateEnum
CREATE TYPE "CollageLayout" AS ENUM ('MASONRY', 'STACKED', 'ASYMMETRICAL_GRID', 'HERO_SUPPORTING', 'HORIZONTAL_STRIP', 'FEATURED_SUPPORTING');

-- CreateEnum
CREATE TYPE "HeroMediaMode" AS ENUM ('SINGLE', 'ROTATING', 'COLLAGE', 'FEATURED_COLLECTION');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "imageUrl" TEXT,
    "price" DOUBLE PRECISION,
    "category" "EventCategory" NOT NULL DEFAULT 'YOGA',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "coverImageUrl" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterSubscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryCollection" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "GalleryCategory" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryImage" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "mediumUrl" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "uploadPath" TEXT,
    "altText" TEXT,
    "description" TEXT,
    "category" "GalleryCategory" NOT NULL DEFAULT 'ART',
    "collectionId" TEXT,
    "sourceKey" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "featuredOnHomepage" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryCollage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "layout" "CollageLayout" NOT NULL DEFAULT 'MASONRY',
    "category" "GalleryCategory" NOT NULL,
    "collectionId" TEXT,
    "imageIds" JSONB NOT NULL DEFAULT '[]',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryCollage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "preferredContactMethod" "PreferredContactMethod",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageSection" (
    "id" TEXT NOT NULL,
    "pageType" "PageType" NOT NULL,
    "sectionType" "PageSectionType" NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "content" TEXT,
    "imageUrl" TEXT,
    "imageAlt" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "layout" JSONB,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteConfig" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "contactAddress" TEXT NOT NULL,
    "social" JSONB NOT NULL,
    "branding" JSONB,
    "navigation" JSONB,
    "homepageLayout" JSONB,
    "homepageSections" JSONB,
    "timelineStyleDefaults" JSONB,
    "timelineStyleByPage" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroSection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "primaryCtaLabel" TEXT NOT NULL,
    "primaryCtaHref" TEXT NOT NULL,
    "secondaryCtaLabel" TEXT NOT NULL,
    "secondaryCtaHref" TEXT NOT NULL,
    "imageSrc" TEXT NOT NULL,
    "imageAlt" TEXT NOT NULL,
    "mediaMode" "HeroMediaMode" NOT NULL DEFAULT 'SINGLE',
    "rotatingImages" JSONB,
    "collageId" TEXT,
    "featuredCollectionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutPage" (
    "id" TEXT NOT NULL,
    "eyebrow" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "imageSrc" TEXT NOT NULL,
    "imageAlt" TEXT NOT NULL,
    "paragraphs" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "quote" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT '',
    "city" TEXT,
    "country" TEXT,
    "imageUrl" TEXT,
    "imageAlt" TEXT,
    "extractedText" TEXT,
    "sourceType" "TestimonialSourceType" NOT NULL DEFAULT 'TEXT',
    "displayStyle" "TestimonialDisplayStyle" NOT NULL DEFAULT 'HANDWRITTEN',
    "ocrConfidence" DOUBLE PRECISION,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "TestimonialStatus" NOT NULL DEFAULT 'APPROVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryCollection_slug_key" ON "GalleryCollection"("slug");

-- CreateIndex
CREATE INDEX "GalleryCollection_category_sortOrder_idx" ON "GalleryCollection"("category", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryImage_sourceKey_key" ON "GalleryImage"("sourceKey");

-- CreateIndex
CREATE INDEX "GalleryImage_category_isPublished_idx" ON "GalleryImage"("category", "isPublished");

-- CreateIndex
CREATE INDEX "GalleryImage_collectionId_sortOrder_idx" ON "GalleryImage"("collectionId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryCollage_slug_key" ON "GalleryCollage"("slug");

-- CreateIndex
CREATE INDEX "GalleryCollage_category_isPublished_idx" ON "GalleryCollage"("category", "isPublished");

-- CreateIndex
CREATE INDEX "GalleryCollage_collectionId_idx" ON "GalleryCollage"("collectionId");

-- CreateIndex
CREATE INDEX "PageSection_pageType_sortOrder_idx" ON "PageSection"("pageType", "sortOrder");

-- CreateIndex
CREATE INDEX "Testimonial_status_featured_sortOrder_idx" ON "Testimonial"("status", "featured", "sortOrder");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryImage" ADD CONSTRAINT "GalleryImage_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "GalleryCollection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryCollage" ADD CONSTRAINT "GalleryCollage_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "GalleryCollection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroSection" ADD CONSTRAINT "HeroSection_collageId_fkey" FOREIGN KEY ("collageId") REFERENCES "GalleryCollage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
