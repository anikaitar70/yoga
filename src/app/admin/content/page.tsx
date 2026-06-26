import { fetchAboutPage } from "@/content/repositories/about";
import { fetchHero } from "@/content/repositories/hero";
import { fetchSite } from "@/content/repositories/site";
import { fetchAllTestimonials } from "@/content/repositories/testimonials";
import { fetchHomepageSections } from "@/content/repositories/site";
import AdminContentClient from "@/components/admin/AdminContentClient";
import { prisma } from "@/lib/prisma";

export default async function AdminContentPage() {
  const [heroContent, aboutContent, siteContent, homepageSections, testimonials, galleryRecords, collections, collages, heroRecord, siteConfigRow] =
    await Promise.all([
      fetchHero(),
      fetchAboutPage(),
      fetchSite(),
      fetchHomepageSections(),
      fetchAllTestimonials(),
      prisma.galleryImage.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        include: { collection: { select: { slug: true } } },
      }),
      prisma.galleryCollection.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.galleryCollage.findMany({ orderBy: { name: "asc" } }),
      prisma.heroSection.findFirst(),
      prisma.siteConfig.findFirst({ orderBy: { updatedAt: "desc" }, select: { localeContent: true } }),
    ]);

  const hero = {
    id: heroRecord?.id ?? "hero",
    title: heroContent.title,
    subtitle: heroContent.subtitle,
    primaryCtaLabel: heroContent.primaryCta.label,
    primaryCtaHref: heroContent.primaryCta.href,
    secondaryCtaLabel: heroContent.secondaryCta.label,
    secondaryCtaHref: heroContent.secondaryCta.href,
    imageSrc: heroContent.imageSrc,
    imageAlt: heroContent.imageAlt,
    mediaMode: heroRecord?.mediaMode ?? "SINGLE",
    rotatingImages: Array.isArray(heroRecord?.rotatingImages)
      ? (heroRecord.rotatingImages as { url: string; alt: string }[])
      : [],
    collageId: heroRecord?.collageId ?? null,
    featuredCollectionId: heroRecord?.featuredCollectionId ?? null,
  };

  const about = {
    id: "about",
    eyebrow: aboutContent.eyebrow ?? "",
    title: aboutContent.title,
    subtitle: aboutContent.subtitle ?? "",
  };

  const site = {
    id: "site",
    name: siteContent.name,
    tagline: siteContent.tagline,
    navigation: siteContent.navigation,
    social: siteContent.social,
    socialConfig: siteContent.socialConfig,
    branding: siteContent.branding,
    contact: siteContent.contact,
    homepageLayout: siteContent.homepageLayout,
    siteBackground: siteContent.siteBackground,
    localeContent: (siteConfigRow?.localeContent as import("@/lib/i18n/locale-content").LocaleContentStore | null) ?? null,
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Content management</h1>
        <p className="mt-2 text-sm text-slate-600">
          Use the section buttons below to jump between homepage, about, footer, testimonials, and gallery — no scrolling required.
        </p>
      </div>

      <AdminContentClient
        hero={hero}
        about={about}
        site={site}
        homepageSections={homepageSections}
        testimonials={testimonials.map((item) => ({
          id: item.id,
          quote: item.quote,
          name: item.name,
          role: item.role,
          city: item.city ?? null,
          country: item.country ?? null,
          imageUrl: item.imageUrl ?? null,
          imageAlt: item.imageAlt ?? null,
          extractedText: item.extractedText ?? null,
          sourceType: item.sourceType ?? "text",
          displayStyle: item.displayStyle ?? "handwritten",
          ocrConfidence: item.ocrConfidence ?? null,
          featured: item.featured ?? false,
          sortOrder: item.sortOrder ?? 0,
          status: item.status,
        }))}
        collections={collections.map((collection) => ({
          id: collection.id,
          slug: collection.slug,
          title: collection.title,
          description: collection.description,
          category: collection.category,
          sortOrder: collection.sortOrder,
        }))}
        gallery={galleryRecords.map((item) => ({
          id: item.id,
          title: item.title,
          src: item.url,
          alt: item.altText ?? "",
          thumbnailUrl: item.thumbnailUrl,
          mediumUrl: item.mediumUrl,
          width: item.width,
          height: item.height,
          description: item.description ?? undefined,
          category: item.category,
          collectionId: item.collectionId,
          collectionSlug: item.collection?.slug ?? null,
          sortOrder: item.sortOrder,
          featuredOnHomepage: item.featuredOnHomepage,
          isPublished: item.isPublished,
        }))}
        collages={collages.map((collage) => ({
          id: collage.id,
          name: collage.name,
          slug: collage.slug,
          layout: collage.layout,
          category: collage.category,
          collectionId: collage.collectionId,
          imageIds: Array.isArray(collage.imageIds) ? (collage.imageIds as string[]) : [],
          isPublished: collage.isPublished,
        }))}
      />
    </div>
  );
}
