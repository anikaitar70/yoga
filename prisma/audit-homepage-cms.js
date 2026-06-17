const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const heroCount = await prisma.heroSection.count();
  const site = await prisma.siteConfig.findFirst({
    select: { homepageSections: true, homepageLayout: true, name: true },
  });
  const hs = site?.homepageSections;
  const testimonialCount = await prisma.testimonial.count({ where: { status: "APPROVED" } });
  const featuredGallery = await prisma.galleryImage.count({
    where: { featuredOnHomepage: true, isPublished: true },
  });
  const featuredEvents = await prisma.event.count({ where: { isFeatured: true, published: true } });
  const retreatEvents = await prisma.event.count({
    where: { published: true, category: { in: ["RETREAT", "RETREATS_AND_TOURS"] } },
  });

  console.log(JSON.stringify({
    siteName: site?.name,
    heroSectionRows: heroCount,
    homepageLayoutPresent: Boolean(site?.homepageLayout),
    homepageSectionsKeys: hs && typeof hs === "object" ? Object.keys(hs) : [],
    aboutPreviewPresent: Boolean(hs?.aboutPreview),
    philosophyPresent: Boolean(hs?.philosophy),
    pathwaysCount: Array.isArray(hs?.pathways) ? hs.pathways.length : 0,
    weeklySessionsCount: Array.isArray(hs?.weeklySessions) ? hs.weeklySessions.length : 0,
    upcomingProgramsCount: Array.isArray(hs?.upcomingPrograms) ? hs.upcomingPrograms.length : 0,
    approvedTestimonials: testimonialCount,
    featuredGalleryImages: featuredGallery,
    featuredEvents,
    retreatEvents,
    homePageSectionRows: 0,
  }, null, 2));
}

main().finally(() => prisma.$disconnect());
