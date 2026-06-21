"use client";

import { cn } from "@/lib/utils";

export type CmsSectionId =
  | "preview"
  | "hero"
  | "homepage-sections"
  | "about"
  | "site"
  | "testimonials"
  | "gallery";

export const CMS_SECTIONS: { id: CmsSectionId; label: string; description: string }[] = [
  {
    id: "preview",
    label: "Preview studio",
    description: "Full homepage preview with layout controls (desktop, tablet, mobile)",
  },
  {
    id: "hero",
    label: "Hero",
    description: "Homepage headline, buttons, and main image",
  },
  {
    id: "homepage-sections",
    label: "Homepage sections",
    description: "Section headings, pathways, events, gallery, testimonials, contact, and more",
  },
  {
    id: "about",
    label: "About page",
    description: "/about hero (eyebrow, title, subtitle)",
  },
  {
    id: "site",
    label: "Site & footer",
    description: "Site name, page background, branding logos, Instagram, and contact details",
  },
  {
    id: "testimonials",
    label: "Testimonials",
    description: "Quotes shown on the homepage",
  },
  {
    id: "gallery",
    label: "Gallery",
    description: "Photos, collections, and collages",
  },
];

type CmsSectionNavProps = {
  active: CmsSectionId;
  onSelect: (section: CmsSectionId) => void;
};

export function CmsSectionNav({ active, onSelect }: CmsSectionNavProps) {
  const current = CMS_SECTIONS.find((section) => section.id === active);

  return (
    <div className="sticky top-0 z-20 -mx-1 rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        Jump to a section
      </p>
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="CMS sections"
      >
        {CMS_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            role="tab"
            aria-selected={active === section.id}
            onClick={() => onSelect(section.id)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              active === section.id
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200",
            )}
          >
            {section.label}
          </button>
        ))}
      </div>
      {current ? (
        <p className="mt-2 text-xs text-slate-600">{current.description}</p>
      ) : null}
    </div>
  );
}
