import { fetchFeaturedEvents, fetchEventsByCategory, fetchUpcomingEvents } from "@/content/repositories/events";
import { fetchHero } from "@/content/repositories/hero";
import { fetchHomepageSections, fetchSite } from "@/content/repositories/site";
import { fetchTestimonials } from "@/content";
import { BrandingProvider } from "@/components/branding/BrandingProvider";
import { DesignSettingsProvider } from "@/components/design/DesignSettingsProvider";
import { parseDesignSettings } from "@/lib/design-settings";
import { HomepagePreviewStudio } from "@/components/admin/HomepagePreviewStudio";
import { HeroPreviewSection } from "@/components/home/HeroPreviewSection";
import {
  AboutPreviewSectionView,
  ContactPreviewSectionView,
  FeaturedEventsSectionView,
  GalleryPreviewSection,
  NewsletterSectionView,
  PathwayPreviewSection,
  PhilosophySectionView,
  RetreatsPreviewSectionView,
  TestimonialsSectionView,
} from "@/components/home/HomepageSectionViews";
import {
  PATHWAY_SECTION_IDS,
  resolveHomepageAboutImageSide,
  resolveHomepagePathwayImageSide,
  resolveHomepageSectionLayouts,
  type HomepageLayoutSettings,
} from "@/lib/homepage-layout";
import { DEFAULT_HOMEPAGE_SPACING } from "@/lib/homepage-spacing";
import type { HomepageSectionsContent } from "@/lib/homepage-sections";
import type { ProgramPathway } from "@/components/home/ProgramPathwaySection";
import { prisma } from "@/lib/prisma";

const DEFAULT_VARIANTS: ProgramPathway["variant"][] = ["default", "warm", "muted"];

export default async function AdminHomepagePreviewPage() {
  const [hero, site, homepageSections, featuredEvents, upcomingEvents, retreats, testimonials, galleryRecords] =
    await Promise.all([
      fetchHero(),
      fetchSite(),
      fetchHomepageSections(),
      fetchFeaturedEvents(12),
      fetchUpcomingEvents(12),
      fetchEventsByCategory("retreats").then((items) => items.slice(0, 3)),
      fetchTestimonials(),
      prisma.galleryImage.findMany({
        where: { featuredOnHomepage: true, isPublished: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        include: { collection: { select: { slug: true } } },
      }),
    ]);

  const homepageLayout =
    (site.homepageLayout as HomepageLayoutSettings | undefined) ?? DEFAULT_HOMEPAGE_SPACING;
  const sectionLayouts = resolveHomepageSectionLayouts(homepageLayout);

  const events =
    featuredEvents.length > 0 ? featuredEvents : upcomingEvents;

  const pathways: ProgramPathway[] = homepageSections.pathways.map((pathway, index) => ({
    ...pathway,
    variant: pathway.variant ?? DEFAULT_VARIANTS[index] ?? "default",
    imageSide: resolveHomepagePathwayImageSide(pathway, index),
  }));

  const galleryItems = galleryRecords.map((item) => ({
    id: item.id,
    src: item.url,
    alt: item.altText ?? "",
    title: item.title ?? undefined,
    description: item.description ?? undefined,
    category: item.category,
    collectionId: item.collectionId ?? undefined,
    collectionSlug: item.collection?.slug ?? undefined,
    featuredOnHomepage: item.featuredOnHomepage,
  }));

  const sectionElements = [
    {
      id: "hero" as const,
      node: <HeroPreviewSection hero={hero} layout={sectionLayouts.hero} />,
    },
    {
      id: "about-preview" as const,
      node: (
        <AboutPreviewSectionView
          about={{
            ...homepageSections.aboutPreview,
            imageSide: resolveHomepageAboutImageSide(homepageSections.aboutPreview),
          }}
          layout={sectionLayouts["about-preview"]}
        />
      ),
    },
    {
      id: "philosophy" as const,
      node: (
        <PhilosophySectionView
          philosophy={homepageSections.philosophy}
          layout={sectionLayouts.philosophy}
        />
      ),
    },
    ...pathways.map((pathway, index) => ({
      id: PATHWAY_SECTION_IDS[index]!,
      node: (
        <PathwayPreviewSection
          pathway={pathway}
          layout={sectionLayouts[PATHWAY_SECTION_IDS[index]!]}
        />
      ),
    })),
    {
      id: "featured-events" as const,
      node: (
        <FeaturedEventsSectionView
          events={events}
          chrome={homepageSections.featuredEvents}
          layout={sectionLayouts["featured-events"]}
        />
      ),
      visible: events.length > 0,
    },
    {
      id: "retreats" as const,
      node: (
        <RetreatsPreviewSectionView
          events={retreats}
          chrome={homepageSections.retreats}
          layout={sectionLayouts.retreats}
        />
      ),
      visible: retreats.length > 0,
    },
    {
      id: "gallery" as const,
      node: (
        <GalleryPreviewSection
          items={galleryItems}
          chrome={homepageSections.gallery}
          layout={sectionLayouts.gallery}
        />
      ),
    },
    {
      id: "testimonials" as const,
      node: (
        <TestimonialsSectionView
          items={testimonials}
          chrome={homepageSections.testimonials}
          layout={sectionLayouts.testimonials}
        />
      ),
    },
    {
      id: "newsletter" as const,
      node: (
        <NewsletterSectionView
          title={homepageSections.newsletter.title}
          subtitle={homepageSections.newsletter.subtitle}
          layout={sectionLayouts.newsletter}
        />
      ),
    },
    {
      id: "contact" as const,
      node: (
        <ContactPreviewSectionView
          site={site.contact}
          social={site.social}
          chrome={homepageSections.contactPreview}
          layout={sectionLayouts.contact}
        />
      ),
    },
  ];

  return (
    <BrandingProvider branding={site.branding}>
      <DesignSettingsProvider settings={parseDesignSettings(site.designSettings ?? null)}>
        <div className="min-w-0 overflow-x-hidden">
          <HomepagePreviewStudio
            homepageLayout={homepageLayout}
            homepageSections={homepageSections}
            sectionElements={sectionElements}
          />
        </div>
      </DesignSettingsProvider>
    </BrandingProvider>
  );
}
