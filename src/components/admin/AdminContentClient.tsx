"use client";

import { useState } from "react";
import ContentManager from "@/components/admin/ContentManager";
import GalleryManager from "@/components/admin/GalleryManager";
import { CmsSectionNav, type CmsSectionId } from "@/components/admin/CmsSectionNav";
import type {
  AdminAboutPage,
  AdminGalleryCollage,
  AdminGalleryCollection,
  AdminGalleryItem,
  AdminHero,
  AdminSiteConfig,
  AdminTestimonial,
} from "@/lib/admin-types";
import type { HomepageSectionsContent } from "@/lib/homepage-sections";

type AdminContentClientProps = {
  hero: AdminHero;
  about: AdminAboutPage;
  site: AdminSiteConfig;
  homepageSections: HomepageSectionsContent;
  testimonials: AdminTestimonial[];
  collections: AdminGalleryCollection[];
  gallery: AdminGalleryItem[];
  collages: AdminGalleryCollage[];
};

export default function AdminContentClient({
  hero,
  about,
  site,
  homepageSections,
  testimonials,
  collections,
  gallery: initialGallery,
  collages: initialCollages,
}: AdminContentClientProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [gallery, setGallery] = useState(initialGallery);
  const [collages, setCollages] = useState(initialCollages);
  const [activeSection, setActiveSection] = useState<CmsSectionId>("hero");

  return (
    <div className="space-y-6">
      <CmsSectionNav active={activeSection} onSelect={setActiveSection} />

      {message ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      ) : null}

      {activeSection !== "gallery" ? (
        <ContentManager
          hero={hero}
          about={about}
          site={site}
          homepageSections={homepageSections}
          testimonials={testimonials}
          collections={collections.map((collection) => ({
            id: collection.id,
            slug: collection.slug,
            title: collection.title,
          }))}
          collages={collages}
          gallery={gallery}
          activeSection={activeSection}
          onMessage={setMessage}
        />
      ) : (
        <GalleryManager
          collections={collections}
          gallery={gallery}
          collages={collages}
          onGalleryChange={setGallery}
          onCollagesChange={setCollages}
          onMessage={setMessage}
          onSaving={setSaving}
        />
      )}

      {saving ? <p className="text-sm text-slate-500">Saving…</p> : null}
    </div>
  );
}
