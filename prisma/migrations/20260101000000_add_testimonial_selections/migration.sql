-- Testimonial selections for homepage, program pages, and special events
CREATE TABLE IF NOT EXISTS "HomepageTestimonial" (
    "id" TEXT NOT NULL,
    "testimonialId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HomepageTestimonial_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "HomepageTestimonial_testimonialId_key" ON "HomepageTestimonial"("testimonialId");
CREATE INDEX IF NOT EXISTS "HomepageTestimonial_sortOrder_idx" ON "HomepageTestimonial"("sortOrder");

ALTER TABLE "HomepageTestimonial" ADD CONSTRAINT "HomepageTestimonial_testimonialId_fkey" FOREIGN KEY ("testimonialId") REFERENCES "Testimonial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "ProgramPageTestimonial" (
    "id" TEXT NOT NULL,
    "pageType" "PageType" NOT NULL,
    "testimonialId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProgramPageTestimonial_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ProgramPageTestimonial_pageType_testimonialId_key" ON "ProgramPageTestimonial"("pageType", "testimonialId");
CREATE INDEX IF NOT EXISTS "ProgramPageTestimonial_pageType_sortOrder_idx" ON "ProgramPageTestimonial"("pageType", "sortOrder");

ALTER TABLE "ProgramPageTestimonial" ADD CONSTRAINT "ProgramPageTestimonial_testimonialId_fkey" FOREIGN KEY ("testimonialId") REFERENCES "Testimonial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "SpecialEventTestimonial" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "testimonialId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SpecialEventTestimonial_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SpecialEventTestimonial_eventId_testimonialId_key" ON "SpecialEventTestimonial"("eventId", "testimonialId");
CREATE INDEX IF NOT EXISTS "SpecialEventTestimonial_eventId_sortOrder_idx" ON "SpecialEventTestimonial"("eventId", "sortOrder");

ALTER TABLE "SpecialEventTestimonial" ADD CONSTRAINT "SpecialEventTestimonial_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SpecialEventTestimonial" ADD CONSTRAINT "SpecialEventTestimonial_testimonialId_fkey" FOREIGN KEY ("testimonialId") REFERENCES "Testimonial"("id") ON DELETE CASCADE ON UPDATE CASCADE;
