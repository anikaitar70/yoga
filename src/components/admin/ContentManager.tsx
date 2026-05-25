"use client";

import { useMemo, useState } from "react";
import type {
  AdminAboutPage,
  AdminGalleryItem,
  AdminHero,
  AdminSiteConfig,
  AdminTestimonial,
} from "@/lib/admin-types";

type Props = {
  hero: AdminHero;
  about: AdminAboutPage;
  site: AdminSiteConfig;
  testimonials: AdminTestimonial[];
  gallery: AdminGalleryItem[];
};

function formatSocialInput(social: { label: string; href: string }[]) {
  return social.map((item) => `${item.label}|${item.href}`).join("\n");
}

function parseSocialInput(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, href] = line.split("|").map((item) => item.trim());
      return { label: label ?? "", href: href ?? "" };
    });
}

async function sendJson<T>(url: string, method: string, payload: unknown) {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || response.statusText);
  }

  return (await response.json()) as T;
}

export default function ContentManager({ hero, about, site, testimonials, gallery }: Props) {
  const [heroData, setHeroData] = useState(hero);
  const [aboutData, setAboutData] = useState(about);
  const [siteData, setSiteData] = useState(site);
  const [testimonialList, setTestimonialList] = useState(testimonials);
  const [galleryItems, setGalleryItems] = useState(gallery);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [testimonialForm, setTestimonialForm] = useState<AdminTestimonial>({
    id: "",
    name: "",
    role: "",
    quote: "",
    status: "pending",
  });

  const [galleryForm, setGalleryForm] = useState<AdminGalleryItem>({
    id: "",
    src: "",
    alt: "",
    title: "",
  });

  const socialText = useMemo(() => formatSocialInput(siteData.social), [siteData.social]);
  const [socialInput, setSocialInput] = useState(socialText);

  const handleSave = async (url: string, data: unknown, apply: (result: any) => void) => {
    setSaving(true);
    setMessage(null);

    try {
      const result = await sendJson(url, "PUT", data);
      apply(result);
      setMessage("Saved successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleHeroSave = async () => {
    await handleSave("/api/cms/hero", heroData, setHeroData);
  };

  const handleAboutSave = async () => {
    await handleSave("/api/cms/about", aboutData, setAboutData);
  };

  const handleSiteSave = async () => {
    const payload = { ...siteData, social: parseSocialInput(socialInput) };

    await handleSave(
      "/api/cms/site",
      {
        ...payload,
        contactEmail: payload.contact.email,
        contactPhone: payload.contact.phone,
        contactAddress: payload.contact.address,
        social: payload.social,
      },
      (result: any) => {
        setSiteData({
          id: result.id,
          name: result.name,
          tagline: result.tagline,
          navigation: siteData.navigation,
          social: result.social ?? [],
          contact: {
            email: result.contactEmail,
            phone: result.contactPhone,
            address: result.contactAddress,
          },
        });
      },
    );
  };

  const handleTestimonialSave = async () => {
    const payload = { name: testimonialForm.name, role: testimonialForm.role, quote: testimonialForm.quote, status: testimonialForm.status };
    try {
      setSaving(true);
      setMessage(null);
      const result = testimonialForm.id
        ? await sendJson<AdminTestimonial>(`/api/cms/testimonials/${testimonialForm.id}`, "PUT", payload)
        : await sendJson<AdminTestimonial>("/api/cms/testimonials", "POST", payload);

      const updatedList = testimonialForm.id
        ? testimonialList.map((item) => (item.id === result.id ? result : item))
        : [result, ...testimonialList];

      setTestimonialList(updatedList);
      setTestimonialForm({ id: "", name: "", role: "", quote: "", status: "pending" });
      setMessage("Testimonial saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleGallerySave = async () => {
    const payload = { src: galleryForm.src, alt: galleryForm.alt, title: galleryForm.title };
    try {
      setSaving(true);
      setMessage(null);
      const result = galleryForm.id
        ? await sendJson<any>(`/api/cms/gallery/${galleryForm.id}`, "PUT", payload)
        : await sendJson<any>("/api/cms/gallery", "POST", payload);

      const mappedResult: AdminGalleryItem = {
        id: result.id,
        src: result.url,
        alt: result.altText ?? "",
        title: result.title ?? null,
        aspectClass: result.aspectClass ?? undefined,
        description: result.description ?? undefined,
        isPublished: result.isPublished ?? true,
      };

      const updatedItems = galleryForm.id
        ? galleryItems.map((item) => (item.id === mappedResult.id ? mappedResult : item))
        : [mappedResult, ...galleryItems];

      setGalleryItems(updatedItems);
      setGalleryForm({ id: "", src: "", alt: "", title: "" });
      setMessage("Gallery item saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const selectTestimonial = (testimonial: AdminTestimonial) => {
    setTestimonialForm(testimonial);
    setMessage(null);
  };

  const selectGalleryItem = (item: AdminGalleryItem) => {
    setGalleryForm(item);
    setMessage(null);
  };

  return (
    <div className="space-y-10">
      {message ? <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{message}</div> : null}

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
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
            <label htmlFor="hero-image-src" className="grid gap-2 sm:grid-cols-2">
              <span className="text-sm font-medium text-slate-700">Image URL</span>
              <input id="hero-image-src" value={heroData.imageSrc} onChange={(event) => setHeroData({ ...heroData, imageSrc: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
            </label>
            <label htmlFor="hero-image-alt" className="grid gap-2 sm:grid-cols-2">
              <span className="text-sm font-medium text-slate-700">Image alt text</span>
              <input id="hero-image-alt" value={heroData.imageAlt} onChange={(event) => setHeroData({ ...heroData, imageAlt: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
            </label>
          </div>
          <button disabled={saving} onClick={handleHeroSave} className="mt-6 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60">
            Save hero
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">About page</h2>
          <div className="mt-4 space-y-4">
            <label htmlFor="about-eyebrow" className="block text-sm font-medium text-slate-700">Eyebrow</label>
            <input id="about-eyebrow" value={aboutData.eyebrow} onChange={(event) => setAboutData({ ...aboutData, eyebrow: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
            <label htmlFor="about-title" className="block text-sm font-medium text-slate-700">Title</label>
            <input id="about-title" value={aboutData.title} onChange={(event) => setAboutData({ ...aboutData, title: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
            <label htmlFor="about-subtitle" className="block text-sm font-medium text-slate-700">Subtitle</label>
            <textarea id="about-subtitle" value={aboutData.subtitle} onChange={(event) => setAboutData({ ...aboutData, subtitle: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" rows={4} />
            <label htmlFor="about-paragraphs" className="block text-sm font-medium text-slate-700">Paragraphs (one per line)</label>
            <textarea id="about-paragraphs" value={aboutData.paragraphs.join("\n")} onChange={(event) => setAboutData({ ...aboutData, paragraphs: event.target.value.split("\n").filter(Boolean) })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" rows={5} />
          </div>
          <button disabled={saving} onClick={handleAboutSave} className="mt-6 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60">
            Save about section
          </button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Site / footer</h2>
          <div className="mt-4 space-y-4">
            <label htmlFor="site-name" className="block text-sm font-medium text-slate-700">Site name</label>
            <input id="site-name" value={siteData.name} onChange={(event) => setSiteData({ ...siteData, name: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
            <label htmlFor="site-tagline" className="block text-sm font-medium text-slate-700">Tagline</label>
            <textarea id="site-tagline" value={siteData.tagline} onChange={(event) => setSiteData({ ...siteData, tagline: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" rows={3} />
            <label htmlFor="site-contact-email" className="block text-sm font-medium text-slate-700">Contact email</label>
            <input id="site-contact-email" value={siteData.contact.email} onChange={(event) => setSiteData({ ...siteData, contact: { ...siteData.contact, email: event.target.value } })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
            <label htmlFor="site-contact-phone" className="block text-sm font-medium text-slate-700">Contact phone</label>
            <input id="site-contact-phone" value={siteData.contact.phone} onChange={(event) => setSiteData({ ...siteData, contact: { ...siteData.contact, phone: event.target.value } })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
            <label htmlFor="site-contact-address" className="block text-sm font-medium text-slate-700">Contact address</label>
            <input id="site-contact-address" value={siteData.contact.address} onChange={(event) => setSiteData({ ...siteData, contact: { ...siteData.contact, address: event.target.value } })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
            <label htmlFor="site-social-links" className="block text-sm font-medium text-slate-700">Social links (label|href per line)</label>
            <textarea id="site-social-links" value={socialInput} onChange={(event) => setSocialInput(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" rows={5} />
          </div>
          <button disabled={saving} onClick={handleSiteSave} className="mt-6 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60">
            Save site config
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Testimonials</h2>
          <div className="mt-4 space-y-4">
            {testimonialList.map((item) => (
              <button key={item.id} type="button" onClick={() => selectTestimonial(item)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-100">
                <strong>{item.name}</strong> · {item.role}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Testimonial editor</h2>
          <div className="mt-4 space-y-4">
            <label htmlFor="testimonial-name" className="block text-sm font-medium text-slate-700">Name</label>
            <input id="testimonial-name" value={testimonialForm.name} onChange={(event) => setTestimonialForm({ ...testimonialForm, name: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
            <label htmlFor="testimonial-role" className="block text-sm font-medium text-slate-700">Role</label>
            <input id="testimonial-role" value={testimonialForm.role} onChange={(event) => setTestimonialForm({ ...testimonialForm, role: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
            <label htmlFor="testimonial-quote" className="block text-sm font-medium text-slate-700">Quote</label>
            <textarea id="testimonial-quote" value={testimonialForm.quote} onChange={(event) => setTestimonialForm({ ...testimonialForm, quote: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" rows={4} />
            <label htmlFor="testimonial-status" className="block text-sm font-medium text-slate-700">Status</label>
            <select id="testimonial-status" value={testimonialForm.status} onChange={(event) => setTestimonialForm({ ...testimonialForm, status: event.target.value as any })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="mt-6 flex gap-3">
            <button disabled={saving} onClick={handleTestimonialSave} className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60">
              {testimonialForm.id ? "Update testimonial" : "Add testimonial"}
            </button>
            <button type="button" onClick={() => setTestimonialForm({ id: "", name: "", role: "", quote: "", status: "pending" })} className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Clear
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Gallery management</h2>
          <div className="mt-4 space-y-4">
            {galleryItems.map((item) => (
              <button key={item.id} type="button" onClick={() => selectGalleryItem(item)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-100">
                <strong>{item.title || item.alt}</strong>
                <div className="text-xs text-slate-500">{item.src}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Gallery editor</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <label htmlFor="gallery-src" className="block text-sm font-medium text-slate-700">Image URL</label>
          <input id="gallery-src" value={galleryForm.src ?? ""} onChange={(event) => setGalleryForm({ ...galleryForm, src: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
          <label htmlFor="gallery-alt" className="block text-sm font-medium text-slate-700">Alt text</label>
          <input id="gallery-alt" value={galleryForm.alt ?? ""} onChange={(event) => setGalleryForm({ ...galleryForm, alt: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
          <label htmlFor="gallery-title" className="block text-sm font-medium text-slate-700">Title</label>
          <input id="gallery-title" value={galleryForm.title ?? ""} onChange={(event) => setGalleryForm({ ...galleryForm, title: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
        </div>
        <div className="mt-6 flex gap-3">
          <button disabled={saving} onClick={handleGallerySave} className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60">
            {galleryForm.id ? "Update gallery item" : "Add gallery item"}
          </button>
          <button type="button" onClick={() => setGalleryForm({ id: "", src: "", alt: "", title: "" })} className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Clear
          </button>
        </div>
      </section>
    </div>
  );
}
