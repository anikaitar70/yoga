"use client";

import { useState } from "react";
import ImageUploadField from "@/components/admin/ImageUploadField";
import type {
  HomepageSectionsContent,
  ProgramPathwayContent,
  UpcomingProgramItem,
  WeeklySessionItem,
} from "@/lib/homepage-sections";
import { adminJsonRequest } from "@/lib/admin-fetch";

type HomepageSectionsEditorProps = {
  initial: HomepageSectionsContent;
  onMessage: (message: string | null) => void;
};

const inputClass = "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm";
const labelClass = "block text-sm font-medium text-slate-700";

function SectionChromeFields({
  title,
  values,
  onChange,
  showDualCta = false,
}: {
  title: string;
  values: {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    primaryCta?: { label: string; href: string };
    secondaryCta?: { label: string; href: string };
  };
  onChange: (patch: Partial<typeof values>) => void;
  showDualCta?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className={labelClass}>
          Eyebrow
          <input
            className={inputClass}
            value={values.eyebrow ?? ""}
            onChange={(e) => onChange({ eyebrow: e.target.value })}
          />
        </label>
        <label className={labelClass}>
          Title
          <input
            className={inputClass}
            value={values.title}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </label>
        <label className={`${labelClass} sm:col-span-2`}>
          Subtitle
          <textarea
            className={inputClass}
            rows={2}
            value={values.subtitle ?? ""}
            onChange={(e) => onChange({ subtitle: e.target.value })}
          />
        </label>
        {showDualCta ? (
          <>
            <label className={labelClass}>
              Primary CTA label
              <input
                className={inputClass}
                value={values.primaryCta?.label ?? ""}
                onChange={(e) =>
                  onChange({
                    primaryCta: {
                      label: e.target.value,
                      href: values.primaryCta?.href ?? "/contact",
                    },
                  })
                }
              />
            </label>
            <label className={labelClass}>
              Primary CTA link
              <input
                className={inputClass}
                value={values.primaryCta?.href ?? ""}
                onChange={(e) =>
                  onChange({
                    primaryCta: {
                      href: e.target.value,
                      label: values.primaryCta?.label ?? "",
                    },
                  })
                }
              />
            </label>
            <label className={labelClass}>
              Secondary CTA label
              <input
                className={inputClass}
                value={values.secondaryCta?.label ?? ""}
                onChange={(e) =>
                  onChange({
                    secondaryCta: {
                      label: e.target.value,
                      href: values.secondaryCta?.href ?? "/events",
                    },
                  })
                }
              />
            </label>
            <label className={labelClass}>
              Secondary CTA link
              <input
                className={inputClass}
                value={values.secondaryCta?.href ?? ""}
                onChange={(e) =>
                  onChange({
                    secondaryCta: {
                      href: e.target.value,
                      label: values.secondaryCta?.label ?? "",
                    },
                  })
                }
              />
            </label>
          </>
        ) : (
          <>
            <label className={labelClass}>
              CTA label
              <input
                className={inputClass}
                value={values.primaryCta?.label ?? ""}
                onChange={(e) =>
                  onChange({
                    primaryCta: {
                      label: e.target.value,
                      href: values.primaryCta?.href ?? "/",
                    },
                  })
                }
              />
            </label>
            <label className={labelClass}>
              CTA link
              <input
                className={inputClass}
                value={values.primaryCta?.href ?? ""}
                onChange={(e) =>
                  onChange({
                    primaryCta: {
                      href: e.target.value,
                      label: values.primaryCta?.label ?? "",
                    },
                  })
                }
              />
            </label>
          </>
        )}
      </div>
    </div>
  );
}

export function HomepageSectionsEditor({
  initial,
  onMessage,
}: HomepageSectionsEditorProps) {
  const [sections, setSections] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    try {
      setSaving(true);
      onMessage(null);
      await adminJsonRequest("/api/cms/site", "PUT", {
        homepageSections: sections,
      });
      onMessage("Homepage sections saved.");
    } catch (error) {
      onMessage(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  function updatePathway(index: number, patch: Partial<ProgramPathwayContent>) {
    setSections((s) => {
      const pathways = [...s.pathways];
      pathways[index] = { ...pathways[index], ...patch };
      return { ...s, pathways };
    });
  }

  function updateWeeklySession(index: number, patch: Partial<WeeklySessionItem>) {
    setSections((s) => {
      const weeklySessions = [...s.weeklySessions];
      weeklySessions[index] = { ...weeklySessions[index], ...patch };
      return { ...s, weeklySessions };
    });
  }

  function updateUpcomingProgram(index: number, patch: Partial<UpcomingProgramItem>) {
    setSections((s) => {
      const upcomingPrograms = [...s.upcomingPrograms];
      upcomingPrograms[index] = { ...upcomingPrograms[index], ...patch };
      return { ...s, upcomingPrograms };
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Homepage — About preview</h2>
        <p className="mt-1 text-xs text-slate-500">Image + text block below the hero.</p>
        <div className="mt-4 space-y-3">
          <label className={labelClass}>
            Eyebrow
            <input
              className={inputClass}
              value={sections.aboutPreview.eyebrow ?? ""}
              onChange={(e) =>
                setSections((s) => ({
                  ...s,
                  aboutPreview: { ...s.aboutPreview, eyebrow: e.target.value },
                }))
              }
            />
          </label>
          <input
            className={inputClass}
            value={sections.aboutPreview.heading}
            onChange={(e) =>
              setSections((s) => ({
                ...s,
                aboutPreview: { ...s.aboutPreview, heading: e.target.value },
              }))
            }
            placeholder="Heading"
          />
          <textarea
            className={inputClass}
            rows={4}
            value={sections.aboutPreview.body}
            onChange={(e) =>
              setSections((s) => ({
                ...s,
                aboutPreview: { ...s.aboutPreview, body: e.target.value },
              }))
            }
          />
          <textarea
            className={inputClass}
            rows={4}
            value={sections.aboutPreview.highlights.join("\n")}
            onChange={(e) =>
              setSections((s) => ({
                ...s,
                aboutPreview: {
                  ...s.aboutPreview,
                  highlights: e.target.value.split("\n").filter(Boolean),
                },
              }))
            }
            placeholder="Highlights (one per line)"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={labelClass}>
              Link label
              <input
                className={inputClass}
                value={sections.aboutPreview.linkLabel}
                onChange={(e) =>
                  setSections((s) => ({
                    ...s,
                    aboutPreview: { ...s.aboutPreview, linkLabel: e.target.value },
                  }))
                }
              />
            </label>
            <label className={labelClass}>
              Link URL
              <input
                className={inputClass}
                value={sections.aboutPreview.linkHref}
                onChange={(e) =>
                  setSections((s) => ({
                    ...s,
                    aboutPreview: { ...s.aboutPreview, linkHref: e.target.value },
                  }))
                }
              />
            </label>
          </div>
          <ImageUploadField
            label="About image"
            section="homepage"
            value={sections.aboutPreview.imageSrc}
            onChange={(url) =>
              setSections((s) => ({
                ...s,
                aboutPreview: { ...s.aboutPreview, imageSrc: url },
              }))
            }
          />
          <label className={labelClass}>
            Image alt text
            <input
              className={inputClass}
              value={sections.aboutPreview.imageAlt}
              onChange={(e) =>
                setSections((s) => ({
                  ...s,
                  aboutPreview: { ...s.aboutPreview, imageAlt: e.target.value },
                }))
              }
            />
          </label>
          <label className={labelClass}>
            Image side
            <select
              className={inputClass}
              value={sections.aboutPreview.imageSide ?? "left"}
              onChange={(e) =>
                setSections((s) => ({
                  ...s,
                  aboutPreview: {
                    ...s.aboutPreview,
                    imageSide: e.target.value as "left" | "right",
                  },
                }))
              }
            >
              <option value="left">Image left</option>
              <option value="right">Image right</option>
            </select>
          </label>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Philosophy</h2>
        <div className="mt-4 space-y-3">
          <label className={labelClass}>
            Eyebrow
            <input
              className={inputClass}
              value={sections.philosophy.eyebrow ?? ""}
              onChange={(e) =>
                setSections((s) => ({
                  ...s,
                  philosophy: { ...s.philosophy, eyebrow: e.target.value },
                }))
              }
            />
          </label>
          <input
            className={inputClass}
            value={sections.philosophy.heading}
            onChange={(e) =>
              setSections((s) => ({
                ...s,
                philosophy: { ...s.philosophy, heading: e.target.value },
              }))
            }
            placeholder="Heading"
          />
          <textarea
            className={inputClass}
            rows={3}
            value={sections.philosophy.closing ?? ""}
            onChange={(e) =>
              setSections((s) => ({
                ...s,
                philosophy: { ...s.philosophy, closing: e.target.value },
              }))
            }
            placeholder="Closing paragraph"
          />
          {(sections.philosophy.sutras ?? []).map((sutra, index) => (
            <div key={sutra.source} className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-500">{sutra.source}</p>
              <textarea
                className={`${inputClass} mt-2`}
                rows={3}
                value={sutra.interpretation}
                onChange={(e) =>
                  setSections((s) => {
                    const sutras = [...(s.philosophy.sutras ?? [])];
                    sutras[index] = { ...sutras[index], interpretation: e.target.value };
                    return { ...s, philosophy: { ...s.philosophy, sutras } };
                  })
                }
                placeholder="Interpretation (shown on homepage)"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Program pathways (Yoga / Healing / Art)</h2>
        <div className="mt-4 space-y-6">
          {sections.pathways.map((pathway, index) => (
            <div key={`${pathway.href}-${index}`} className="rounded-2xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-900">{pathway.title}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className={labelClass}>
                  Eyebrow
                  <input
                    className={inputClass}
                    value={pathway.eyebrow}
                    onChange={(e) => updatePathway(index, { eyebrow: e.target.value })}
                  />
                </label>
                <label className={labelClass}>
                  Title
                  <input
                    className={inputClass}
                    value={pathway.title}
                    onChange={(e) => updatePathway(index, { title: e.target.value })}
                  />
                </label>
                <div className="sm:col-span-2">
                  <ImageUploadField
                    label="Section logo (optional — replaces title when set)"
                    section="homepage"
                    value={pathway.sectionLogoSrc ?? ""}
                    onChange={(url) => updatePathway(index, { sectionLogoSrc: url || undefined })}
                  />
                </div>
                <label className={labelClass}>
                  Section logo alt text
                  <input
                    className={inputClass}
                    value={pathway.sectionLogoAlt ?? ""}
                    onChange={(e) => updatePathway(index, { sectionLogoAlt: e.target.value || undefined })}
                  />
                </label>
                <label className={`${labelClass} sm:col-span-2`}>
                  Subtitle
                  <input
                    className={inputClass}
                    value={pathway.subtitle}
                    onChange={(e) => updatePathway(index, { subtitle: e.target.value })}
                  />
                </label>
                <label className={`${labelClass} sm:col-span-2`}>
                  Description
                  <textarea
                    className={inputClass}
                    rows={3}
                    value={pathway.description}
                    onChange={(e) => updatePathway(index, { description: e.target.value })}
                  />
                </label>
                <label className={`${labelClass} sm:col-span-2`}>
                  Highlights (one per line)
                  <textarea
                    className={inputClass}
                    rows={3}
                    value={pathway.highlights.join("\n")}
                    onChange={(e) =>
                      updatePathway(index, {
                        highlights: e.target.value.split("\n").filter(Boolean),
                      })
                    }
                  />
                </label>
                <label className={labelClass}>
                  CTA label
                  <input
                    className={inputClass}
                    value={pathway.ctaLabel}
                    onChange={(e) => updatePathway(index, { ctaLabel: e.target.value })}
                  />
                </label>
                <label className={labelClass}>
                  CTA link
                  <input
                    className={inputClass}
                    value={pathway.href}
                    onChange={(e) => updatePathway(index, { href: e.target.value })}
                  />
                </label>
                <label className={labelClass}>
                  Image side
                  <select
                    className={inputClass}
                    value={pathway.imageSide ?? "left"}
                    onChange={(e) =>
                      updatePathway(index, {
                        imageSide: e.target.value as ProgramPathwayContent["imageSide"],
                      })
                    }
                  >
                    <option value="left">Image left</option>
                    <option value="right">Image right</option>
                  </select>
                </label>
                <label className={labelClass}>
                  Section style
                  <select
                    className={inputClass}
                    value={pathway.variant ?? "default"}
                    onChange={(e) =>
                      updatePathway(index, {
                        variant: e.target.value as ProgramPathwayContent["variant"],
                      })
                    }
                  >
                    <option value="default">Default</option>
                    <option value="warm">Warm</option>
                    <option value="muted">Muted</option>
                  </select>
                </label>
                <div className="sm:col-span-2">
                  <ImageUploadField
                    label="Pathway image"
                    section="homepage"
                    value={pathway.imageSrc}
                    onChange={(url) => updatePathway(index, { imageSrc: url })}
                  />
                </div>
                <label className={`${labelClass} sm:col-span-2`}>
                  Image alt text
                  <input
                    className={inputClass}
                    value={pathway.imageAlt}
                    onChange={(e) => updatePathway(index, { imageAlt: e.target.value })}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Featured events</h2>
        <p className="mt-1 text-xs text-slate-500">
          Event cards come from the Events admin. Edit headings and CTAs here.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className={labelClass}>
            Eyebrow
            <input
              className={inputClass}
              value={sections.featuredEvents.eyebrow ?? ""}
              onChange={(e) =>
                setSections((s) => ({
                  ...s,
                  featuredEvents: { ...s.featuredEvents, eyebrow: e.target.value },
                }))
              }
            />
          </label>
          <label className={labelClass}>
            Title (when featured events exist)
            <input
              className={inputClass}
              value={sections.featuredEvents.titleFeatured}
              onChange={(e) =>
                setSections((s) => ({
                  ...s,
                  featuredEvents: { ...s.featuredEvents, titleFeatured: e.target.value },
                }))
              }
            />
          </label>
          <label className={labelClass}>
            Title (fallback / upcoming only)
            <input
              className={inputClass}
              value={sections.featuredEvents.titleUpcoming}
              onChange={(e) =>
                setSections((s) => ({
                  ...s,
                  featuredEvents: { ...s.featuredEvents, titleUpcoming: e.target.value },
                }))
              }
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Subtitle
            <textarea
              className={inputClass}
              rows={2}
              value={sections.featuredEvents.subtitle ?? ""}
              onChange={(e) =>
                setSections((s) => ({
                  ...s,
                  featuredEvents: { ...s.featuredEvents, subtitle: e.target.value },
                }))
              }
            />
          </label>
          <label className={labelClass}>
            CTA label (desktop)
            <input
              className={inputClass}
              value={sections.featuredEvents.ctaLabel ?? ""}
              onChange={(e) =>
                setSections((s) => ({
                  ...s,
                  featuredEvents: { ...s.featuredEvents, ctaLabel: e.target.value },
                }))
              }
            />
          </label>
          <label className={labelClass}>
            CTA label (mobile)
            <input
              className={inputClass}
              value={sections.featuredEvents.ctaLabelMobile ?? ""}
              onChange={(e) =>
                setSections((s) => ({
                  ...s,
                  featuredEvents: { ...s.featuredEvents, ctaLabelMobile: e.target.value },
                }))
              }
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            CTA link
            <input
              className={inputClass}
              value={sections.featuredEvents.ctaHref ?? ""}
              onChange={(e) =>
                setSections((s) => ({
                  ...s,
                  featuredEvents: { ...s.featuredEvents, ctaHref: e.target.value },
                }))
              }
            />
          </label>
        </div>
      </div>

      <SectionChromeFields
        title="Retreats preview"
        values={sections.retreats}
        onChange={(patch) =>
          setSections((s) => ({ ...s, retreats: { ...s.retreats, ...patch } }))
        }
      />

      <SectionChromeFields
        title="Gallery preview"
        values={sections.gallery}
        onChange={(patch) =>
          setSections((s) => ({ ...s, gallery: { ...s.gallery, ...patch } }))
        }
      />
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs text-slate-500">
          Gallery images are managed in Gallery Manager (featured on homepage flag).
        </p>
        <label className={`${labelClass} mt-3 block`}>
          Empty state message
          <textarea
            className={inputClass}
            rows={2}
            value={sections.gallery.emptyMessage ?? ""}
            onChange={(e) =>
              setSections((s) => ({
                ...s,
                gallery: { ...s.gallery, emptyMessage: e.target.value },
              }))
            }
          />
        </label>
      </div>

      <SectionChromeFields
        title="Testimonials"
        values={sections.testimonials}
        onChange={(patch) =>
          setSections((s) => ({ ...s, testimonials: { ...s.testimonials, ...patch } }))
        }
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Newsletter</h2>
        <div className="mt-4 space-y-3">
          <input
            className={inputClass}
            value={sections.newsletter.title}
            onChange={(e) =>
              setSections((s) => ({
                ...s,
                newsletter: { ...s.newsletter, title: e.target.value },
              }))
            }
            placeholder="Title"
          />
          <textarea
            className={inputClass}
            rows={2}
            value={sections.newsletter.subtitle}
            onChange={(e) =>
              setSections((s) => ({
                ...s,
                newsletter: { ...s.newsletter, subtitle: e.target.value },
              }))
            }
            placeholder="Subtitle"
          />
        </div>
      </div>

      <SectionChromeFields
        title="Contact preview"
        values={sections.contactPreview}
        onChange={(patch) =>
          setSections((s) => ({ ...s, contactPreview: { ...s.contactPreview, ...patch } }))
        }
        showDualCta
      />
      <p className="-mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
        Email, phone, and address on the homepage come from{" "}
        <span className="font-semibold text-slate-800">Site &amp; footer</span> — not this section.
        Edit section title, subtitle, and CTAs here only.
      </p>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Sessions schedule (optional)</h2>
        <p className="mt-1 text-xs text-slate-500">
          Not shown on the homepage today. Edit here if you enable the schedule section later.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className={labelClass}>
            Eyebrow
            <input
              className={inputClass}
              value={sections.schedule.eyebrow ?? ""}
              onChange={(e) =>
                setSections((s) => ({
                  ...s,
                  schedule: { ...s.schedule, eyebrow: e.target.value },
                }))
              }
            />
          </label>
          <label className={labelClass}>
            Title
            <input
              className={inputClass}
              value={sections.schedule.title}
              onChange={(e) =>
                setSections((s) => ({
                  ...s,
                  schedule: { ...s.schedule, title: e.target.value },
                }))
              }
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Subtitle
            <textarea
              className={inputClass}
              rows={2}
              value={sections.schedule.subtitle ?? ""}
              onChange={(e) =>
                setSections((s) => ({
                  ...s,
                  schedule: { ...s.schedule, subtitle: e.target.value },
                }))
              }
            />
          </label>
          <label className={labelClass}>
            CTA label
            <input
              className={inputClass}
              value={sections.schedule.primaryCta?.label ?? ""}
              onChange={(e) =>
                setSections((s) => ({
                  ...s,
                  schedule: {
                    ...s.schedule,
                    primaryCta: {
                      label: e.target.value,
                      href: s.schedule.primaryCta?.href ?? "/contact",
                    },
                  },
                }))
              }
            />
          </label>
          <label className={labelClass}>
            CTA link
            <input
              className={inputClass}
              value={sections.schedule.primaryCta?.href ?? ""}
              onChange={(e) =>
                setSections((s) => ({
                  ...s,
                  schedule: {
                    ...s.schedule,
                    primaryCta: {
                      href: e.target.value,
                      label: s.schedule.primaryCta?.label ?? "",
                    },
                  },
                }))
              }
            />
          </label>
          <label className={labelClass}>
            Weekly list title
            <input
              className={inputClass}
              value={sections.schedule.weeklyListTitle ?? ""}
              onChange={(e) =>
                setSections((s) => ({
                  ...s,
                  schedule: { ...s.schedule, weeklyListTitle: e.target.value },
                }))
              }
            />
          </label>
          <label className={labelClass}>
            Program card link label
            <input
              className={inputClass}
              value={sections.schedule.programLinkLabel ?? ""}
              onChange={(e) =>
                setSections((s) => ({
                  ...s,
                  schedule: { ...s.schedule, programLinkLabel: e.target.value },
                }))
              }
            />
          </label>
        </div>
        <div className="mt-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-800">Weekly sessions</h3>
          {sections.weeklySessions.map((session, index) => (
            <div key={index} className="grid gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-2">
              <input
                className={inputClass}
                placeholder="Day"
                value={session.day}
                onChange={(e) => updateWeeklySession(index, { day: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Time"
                value={session.time}
                onChange={(e) => updateWeeklySession(index, { time: e.target.value })}
              />
              <input
                className={`${inputClass} sm:col-span-2`}
                placeholder="Title"
                value={session.title}
                onChange={(e) => updateWeeklySession(index, { title: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Location"
                value={session.location}
                onChange={(e) => updateWeeklySession(index, { location: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Language"
                value={session.language}
                onChange={(e) => updateWeeklySession(index, { language: e.target.value })}
              />
            </div>
          ))}
          <button
            type="button"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
            onClick={() =>
              setSections((s) => ({
                ...s,
                weeklySessions: [
                  ...s.weeklySessions,
                  { day: "", title: "", time: "", location: "", language: "" },
                ],
              }))
            }
          >
            + Add weekly session
          </button>
        </div>
        <div className="mt-8 space-y-4">
          <h3 className="text-sm font-semibold text-slate-800">Upcoming programs</h3>
          {sections.upcomingPrograms.map((program, index) => (
            <div key={index} className="space-y-2 rounded-xl border border-slate-200 p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  className={inputClass}
                  placeholder="Type badge"
                  value={program.type}
                  onChange={(e) => updateUpcomingProgram(index, { type: e.target.value })}
                />
                <input
                  className={inputClass}
                  placeholder="Link"
                  value={program.href}
                  onChange={(e) => updateUpcomingProgram(index, { href: e.target.value })}
                />
              </div>
              <input
                className={inputClass}
                placeholder="Title"
                value={program.title}
                onChange={(e) => updateUpcomingProgram(index, { title: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Location"
                value={program.location}
                onChange={(e) => updateUpcomingProgram(index, { location: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Dates"
                value={program.dates}
                onChange={(e) => updateUpcomingProgram(index, { dates: e.target.value })}
              />
              <textarea
                className={inputClass}
                rows={2}
                placeholder="Detail (optional)"
                value={program.detail ?? ""}
                onChange={(e) => updateUpcomingProgram(index, { detail: e.target.value })}
              />
              <button
                type="button"
                className="text-xs text-red-600"
                onClick={() =>
                  setSections((s) => ({
                    ...s,
                    upcomingPrograms: s.upcomingPrograms.filter((_, i) => i !== index),
                  }))
                }
              >
                Remove program
              </button>
            </div>
          ))}
          <button
            type="button"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
            onClick={() =>
              setSections((s) => ({
                ...s,
                upcomingPrograms: [
                  ...s.upcomingPrograms,
                  { type: "", title: "", location: "", dates: "", href: "/events" },
                ],
              }))
            }
          >
            + Add upcoming program
          </button>
        </div>
      </div>

      <button
        type="button"
        disabled={saving}
        onClick={() => void handleSave()}
        className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save homepage sections"}
      </button>
    </div>
  );
}
