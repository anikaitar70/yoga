import { fetchAboutPage } from "@/content/repositories/about";
import { fetchGalleryItems } from "@/content/repositories/gallery";
import { fetchHero } from "@/content/repositories/hero";
import { fetchSite } from "@/content/repositories/site";
import { fetchAllTestimonials } from "@/content/repositories/testimonials";
import ContentManager from "@/components/admin/ContentManager";

export default async function AdminContentPage() {
  const [heroContent, aboutContent, siteContent, testimonials, gallery] = await Promise.all([
    fetchHero(),
    fetchAboutPage(),
    fetchSite(),
    fetchAllTestimonials(),
    fetchGalleryItems(),
  ]);

  const hero = {
    id: "hero",
    title: heroContent.title,
    subtitle: heroContent.subtitle,
    primaryCtaLabel: heroContent.primaryCta.label,
    primaryCtaHref: heroContent.primaryCta.href,
    secondaryCtaLabel: heroContent.secondaryCta.label,
    secondaryCtaHref: heroContent.secondaryCta.href,
    imageSrc: heroContent.imageSrc,
    imageAlt: heroContent.imageAlt,
  };

  const about = {
    id: "about",
    eyebrow: aboutContent.eyebrow ?? "",
    title: aboutContent.title,
    subtitle: aboutContent.subtitle,
    imageSrc: aboutContent.imageSrc,
    imageAlt: aboutContent.imageAlt,
    paragraphs: aboutContent.paragraphs,
  };

  const site = {
    id: "site",
    name: siteContent.name,
    tagline: siteContent.tagline,
    navigation: siteContent.navigation,
    social: siteContent.social,
    contact: siteContent.contact,
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Content management</h1>
        <p className="mt-2 text-sm text-slate-600">
          Update homepage, about page, footer links, testimonials, and gallery content.
        </p>
      </div>

      <ContentManager
        hero={hero}
        about={about}
        site={site}
        testimonials={testimonials.map((item) => ({
          ...item,
          imageSrc: "",
          isPublished: true,
        }))}
        gallery={gallery.map((item) => ({
          id: item.id,
          title: item.title,
          src: item.src,
          alt: item.alt,
          aspectClass: item.aspectClass,
          description: undefined,
          isPublished: true,
        }))}
      />
    </div>
  );
}
