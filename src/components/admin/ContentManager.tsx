"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { UPLOAD_FILE_HINT } from "@/lib/upload-limits";
import { PreviewStudioLink } from "@/components/admin/PreviewStudioLink";
import { TestimonialManager } from "@/components/admin/TestimonialManager";
import { HomepageSectionsEditor } from "@/components/admin/HomepageSectionsEditor";
import type { HomepageSectionsContent } from "@/lib/homepage-sections";
import type { CmsSectionId } from "@/components/admin/CmsSectionNav";
import type {
  AdminAboutPage,
  AdminGalleryCollage,
  AdminGalleryItem,
  AdminHero,
  AdminSiteConfig,
  AdminTestimonial,
} from "@/lib/admin-types";
import { adminJsonRequest } from "@/lib/admin-fetch";
import { HERO_MEDIA_MODE_LABELS, HERO_MEDIA_MODES } from "@/lib/hero-media";
import type { SiteSocialConfig } from "@/lib/site-social";

type Props = {
  hero: AdminHero;
  about: AdminAboutPage;
  site: AdminSiteConfig;
  homepageSections: HomepageSectionsContent;
  testimonials: AdminTestimonial[];
  collections: { id: string; slug: string; title: string }[];
  collages: AdminGalleryCollage[];
  gallery: AdminGalleryItem[];
  activeSection: CmsSectionId;
  onMessage: (message: string | null) => void;
};

function formatNavInput(navigation: { label: string; href: string }[]) {
  return navigation.map((item) => `${item.label}|${item.href}`).join("\n");
}

function parseNavInput(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, href] = line.split("|").map((item) => item.trim());
      return { label: label ?? "", href: href ?? "" };
    })
    .filter((item) => item.label && item.href);
}

async function sendJson<T>(url: string, method: string, payload: unknown) {
  return adminJsonRequest<T>(url, method, payload);
}

function heroSnapshot(data: AdminHero) {
  return JSON.stringify({
    title: data.title,
    subtitle: data.subtitle,
    primaryCtaLabel: data.primaryCtaLabel,
    primaryCtaHref: data.primaryCtaHref,
    secondaryCtaLabel: data.secondaryCtaLabel,
    secondaryCtaHref: data.secondaryCtaHref,
    imageSrc: data.imageSrc,
    imageAlt: data.imageAlt,
    mediaMode: data.mediaMode,
    rotatingImages: data.rotatingImages,
    collageId: data.collageId,
    featuredCollectionId: data.featuredCollectionId,
  });
}

export default function ContentManager({
  hero,
  about,
  site,
  homepageSections,
  testimonials,
  collections,
  collages,
  gallery,
  activeSection,
  onMessage,
}: Props) {
  const router = useRouter();
  const [heroData, setHeroData] = useState(hero);
  const savedHeroRef = useRef(heroSnapshot(hero));
  const [aboutData, setAboutData] = useState(about);
  const [siteData, setSiteData] = useState(site);
  const [socialConfig, setSocialConfig] = useState<SiteSocialConfig>(site.socialConfig);
  const [saving, setSaving] = useState(false);

  const navText = useMemo(() => formatNavInput(siteData.navigation), [siteData.navigation]);
  const [navInput, setNavInput] = useState(navText);

  const handleSave = async (url: string, data: unknown, apply: (result: any) => void) => {
    setSaving(true);
    onMessage(null);

    try {
      const result = await sendJson(url, "PUT", data);
      apply(result);
      onMessage("Saved successfully.");
    } catch (error) {
      onMessage(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleHeroSave = async () => {
    await handleSave("/api/cms/hero", heroData, (result: AdminHero) => {
      setHeroData(result);
      savedHeroRef.current = heroSnapshot(result);
    });
  };

  const handleAboutSave = async () => {
    const payload = {
      eyebrow: aboutData.eyebrow.trim(),
      title: aboutData.title.trim(),
      subtitle: aboutData.subtitle.trim(),
    };

    if (!payload.eyebrow || !payload.title || !payload.subtitle) {
      onMessage("Eyebrow, title, and subtitle are required before saving.");
      return;
    }

    await handleSave("/api/cms/about", payload, setAboutData);
  };

  const handleSiteSave = async () => {
    const navigation = parseNavInput(navInput);

    await handleSave(
      "/api/cms/site",
      {
        name: siteData.name,
        tagline: siteData.tagline,
        contactEmail: siteData.contact.email,
        contactPhone: siteData.contact.phone,
        contactAddress: siteData.contact.address,
        social: socialConfig,
        navigation,
      },
      (result: {
        id: string;
        name: string;
        tagline: string;
        navigation?: { label: string; href: string }[];
        social?: SiteSocialConfig;
        contactEmail: string;
        contactPhone: string;
        contactAddress: string;
      }) => {
        const savedNavigation =
          Array.isArray(result.navigation) && result.navigation.length > 0
            ? result.navigation
            : navigation;
        const savedSocial = result.social ?? socialConfig;
        setSiteData({
          id: result.id,
          name: result.name,
          tagline: result.tagline,
          navigation: savedNavigation,
          social: siteData.social,
          socialConfig: savedSocial,
          branding: siteData.branding,
          contact: {
            email: result.contactEmail,
            phone: result.contactPhone,
            address: result.contactAddress,
          },
          homepageLayout: siteData.homepageLayout,
          siteBackground: siteData.siteBackground,
        });
        setSocialConfig(savedSocial);
        setNavInput(formatNavInput(savedNavigation));
        router.refresh();
      },
    );
  };

  const previewStudioLink = (
    <PreviewStudioLink
      href="/admin/content/preview"
      title="Preview studio — Homepage"
      description="Full-page preview with desktop, tablet, and mobile modes. Select any section to tune spacing, width, padding, and layout — same controls as Yoga, Healing, Just Art Life, and About."
    />
  );

  const rotatingImagesText = (heroData.rotatingImages ?? [])
    .map((item) => `${item.url}|${item.alt}`)
    .join("\n");

  return (
    <div className="space-y-6">
      {activeSection === "preview" ? previewStudioLink : null}

      {activeSection === "hero" ? (
        <div className="space-y-6">
          {previewStudioLink}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Hero section</h2>
            <div className="mt-4 space-y-4">
            <label htmlFor="hero-title" className="block text-sm font-medium text-slate-700">Title</label>
            <input id="hero-title" value={heroData.title} onChange={(event) => setHeroData({ ...heroData, title: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
            <label htmlFor="hero-subtitle" className="block text-sm font-medium text-slate-700">Subtitle</label>
            <textarea id="hero-subtitle" value={heroData.subtitle} onChange={(event) => setHeroData({ ...heroData, subtitle: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" rows={4} />
            <label htmlFor="hero-primary-cta-label" className="grid gap-2 sm:grid-cols-2">
              <span className="text-sm font-medium text-slate-700">Primary CTA label</span>
              <input id="hero-primary-cta-label" value={heroData.primaryCtaLabel} onChange={(event) => setHeroData({ ...heroData, primaryCtaLabel: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
            </label>
            <label htmlFor="hero-primary-cta-href" className="grid gap-2 sm:grid-cols-2">
              <span className="text-sm font-medium text-slate-700">Primary CTA URL</span>
              <input id="hero-primary-cta-href" value={heroData.primaryCtaHref} onChange={(event) => setHeroData({ ...heroData, primaryCtaHref: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
            </label>
            <label htmlFor="hero-secondary-cta-label" className="grid gap-2 sm:grid-cols-2">
              <span className="text-sm font-medium text-slate-700">Secondary CTA label</span>
              <input id="hero-secondary-cta-label" value={heroData.secondaryCtaLabel} onChange={(event) => setHeroData({ ...heroData, secondaryCtaLabel: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
            </label>
            <label htmlFor="hero-secondary-cta-href" className="grid gap-2 sm:grid-cols-2">
              <span className="text-sm font-medium text-slate-700">Secondary CTA URL</span>
              <input id="hero-secondary-cta-href" value={heroData.secondaryCtaHref} onChange={(event) => setHeroData({ ...heroData, secondaryCtaHref: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
            </label>
            <label htmlFor="hero-media-mode" className="block text-sm font-medium text-slate-700">
              Hero media mode
              <select
                id="hero-media-mode"
                value={heroData.mediaMode ?? "SINGLE"}
                onChange={(event) =>
                  setHeroData({ ...heroData, mediaMode: event.target.value as AdminHero["mediaMode"] })
                }
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              >
                {HERO_MEDIA_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {HERO_MEDIA_MODE_LABELS[mode]}
                  </option>
                ))}
              </select>
            </label>
            {(heroData.mediaMode ?? "SINGLE") === "SINGLE" || (heroData.mediaMode ?? "SINGLE") === "ROTATING" ? (
              <ImageUploadField
                label="Hero image"
                section="homepage"
                value={heroData.imageSrc}
                onChange={(url) => setHeroData({ ...heroData, imageSrc: url })}
                hint={`Homepage hero background. ${UPLOAD_FILE_HINT}`}
              />
            ) : null}
            {(heroData.mediaMode ?? "SINGLE") === "ROTATING" ? (
              <label htmlFor="hero-rotating-images" className="block text-sm font-medium text-slate-700">
                Rotating images (url|alt per line)
                <textarea
                  id="hero-rotating-images"
                  value={rotatingImagesText}
                  onChange={(event) =>
                    setHeroData({
                      ...heroData,
                      rotatingImages: event.target.value
                        .split("\n")
                        .map((line) => line.trim())
                        .filter(Boolean)
                        .map((line) => {
                          const [url, alt] = line.split("|").map((part) => part.trim());
                          return { url: url ?? "", alt: alt ?? heroData.imageAlt };
                        }),
                    })
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                  rows={4}
                />
              </label>
            ) : null}
            {(heroData.mediaMode ?? "SINGLE") === "COLLAGE" ? (
              <label htmlFor="hero-collage" className="block text-sm font-medium text-slate-700">
                Hero collage
                <select
                  id="hero-collage"
                  value={heroData.collageId ?? ""}
                  onChange={(event) =>
                    setHeroData({ ...heroData, collageId: event.target.value || null })
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                >
                  <option value="">Select collage</option>
                  {collages.map((collage) => (
                    <option key={collage.id} value={collage.id}>
                      {collage.name}
                      {!collage.isPublished ? " (draft)" : ""}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {(heroData.mediaMode ?? "SINGLE") === "FEATURED_COLLECTION" ? (
              <label htmlFor="hero-featured-collection" className="block text-sm font-medium text-slate-700">
                Featured collection
                <select
                  id="hero-featured-collection"
                  value={heroData.featuredCollectionId ?? ""}
                  onChange={(event) =>
                    setHeroData({ ...heroData, featuredCollectionId: event.target.value || null })
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                >
                  <option value="">Select collection</option>
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.title}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label htmlFor="hero-image-alt" className="block text-sm font-medium text-slate-700">
              Image alt text
              <input
                id="hero-image-alt"
                value={heroData.imageAlt}
                onChange={(event) => setHeroData({ ...heroData, imageAlt: event.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              />
            </label>
            </div>
            <button
              disabled={saving}
              onClick={handleHeroSave}
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Save hero
            </button>
          </div>
        </div>
      ) : null}

      {activeSection === "about" ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">About page hero</h2>
          <p className="mt-2 text-sm text-slate-600">
            Edit the eyebrow, title, and subtitle shown at the top of{" "}
            <a href="/about" className="font-medium text-slate-800 underline-offset-2 hover:underline">
              /about
            </a>
            . Biography, timeline, and philosophy content are managed in{" "}
            <a
              href="/admin/pages?pageType=ABOUT"
              className="font-medium text-slate-800 underline-offset-2 hover:underline"
            >
              Program pages → About
            </a>
            .
          </p>
          <div className="mt-4 space-y-4">
            <label htmlFor="about-eyebrow" className="block text-sm font-medium text-slate-700">Eyebrow</label>
            <input id="about-eyebrow" value={aboutData.eyebrow} onChange={(event) => setAboutData({ ...aboutData, eyebrow: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
            <label htmlFor="about-title" className="block text-sm font-medium text-slate-700">Title</label>
            <input id="about-title" value={aboutData.title} onChange={(event) => setAboutData({ ...aboutData, title: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
            <label htmlFor="about-subtitle" className="block text-sm font-medium text-slate-700">Subtitle</label>
            <textarea id="about-subtitle" value={aboutData.subtitle} onChange={(event) => setAboutData({ ...aboutData, subtitle: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" rows={4} />
          </div>
          <button disabled={saving} onClick={handleAboutSave} className="mt-6 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60">
            Save about hero
          </button>
        </div>
      ) : null}

      {activeSection === "site" ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Site / footer</h2>
          <div className="mt-4 space-y-4">
            <label htmlFor="site-name" className="block text-sm font-medium text-slate-700">Site name</label>
            <input id="site-name" value={siteData.name} onChange={(event) => setSiteData({ ...siteData, name: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
            <label htmlFor="site-tagline" className="block text-sm font-medium text-slate-700">Tagline</label>
            <textarea id="site-tagline" value={siteData.tagline} onChange={(event) => setSiteData({ ...siteData, tagline: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" rows={3} />
            <label htmlFor="site-navigation" className="block text-sm font-medium text-slate-700">
              Navigation links (label|href per line)
              <textarea
                id="site-navigation"
                value={navInput}
                onChange={(event) => setNavInput(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                rows={6}
              />
            </label>
            <label htmlFor="site-contact-email" className="block text-sm font-medium text-slate-700">Contact email</label>
            <input id="site-contact-email" value={siteData.contact.email} onChange={(event) => setSiteData({ ...siteData, contact: { ...siteData.contact, email: event.target.value } })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
            <label htmlFor="site-contact-phone" className="block text-sm font-medium text-slate-700">Contact phone</label>
            <input id="site-contact-phone" value={siteData.contact.phone} onChange={(event) => setSiteData({ ...siteData, contact: { ...siteData.contact, phone: event.target.value } })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
            <label htmlFor="site-contact-address" className="block text-sm font-medium text-slate-700">Contact address</label>
            <input id="site-contact-address" value={siteData.contact.address} onChange={(event) => setSiteData({ ...siteData, contact: { ...siteData.contact, address: event.target.value } })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Visual design</p>
              <p className="mt-1 text-xs text-slate-600">
                Typography, colors, header layout, hero alignment, branding logos, and navigation styling live in Design settings.
              </p>
              <Link
                href="/admin/design"
                className="mt-3 inline-flex rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
              >
                Open design settings
              </Link>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-900">Instagram</h3>
              <p className="mt-1 text-xs text-slate-500">Single source of truth for studio social links.</p>
              <label htmlFor="social-nirvana-instagram" className="mt-4 block text-sm font-medium text-slate-700">Nirvana Yoga Instagram URL</label>
              <input
                id="social-nirvana-instagram"
                type="url"
                value={socialConfig.nirvanaYogaInstagram}
                onChange={(event) =>
                  setSocialConfig({ ...socialConfig, nirvanaYogaInstagram: event.target.value })
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
              />
              <label htmlFor="social-just-art-instagram" className="mt-4 block text-sm font-medium text-slate-700">Just Art Affaire Instagram URL</label>
              <input
                id="social-just-art-instagram"
                type="url"
                value={socialConfig.justArtAffaireInstagram}
                onChange={(event) =>
                  setSocialConfig({ ...socialConfig, justArtAffaireInstagram: event.target.value })
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
              />
            </div>
          </div>
          <button disabled={saving} onClick={handleSiteSave} className="mt-6 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60">
            Save site config
          </button>
        </div>
      ) : null}

      {activeSection === "homepage-sections" ? (
        <div className="space-y-6">
          {previewStudioLink}
          <HomepageSectionsEditor
          initial={homepageSections}
          onMessage={onMessage}
        />
        </div>
      ) : null}

      {activeSection === "testimonials" ? (
        <TestimonialManager initialTestimonials={testimonials} onMessage={onMessage} />
      ) : null}
    </div>
  );
}
