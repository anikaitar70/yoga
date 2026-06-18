"use client";

import ImageUploadField from "@/components/admin/ImageUploadField";
import { UPLOAD_FILE_HINT } from "@/lib/upload-limits";
import {
  BLOG_SECTION_TYPES,
  createEmptyBlogSection,
  type BlogSection,
  type BlogSectionType,
} from "@/lib/blog-sections";

type BlogSectionsEditorPanelProps = {
  sections: BlogSection[];
  onChange: (sections: BlogSection[]) => void;
};

const SECTION_LABELS: Record<BlogSectionType, string> = {
  TEXT: "Rich text",
  IMAGE: "Image",
  IMAGE_TEXT: "Image + text",
  GALLERY: "Gallery",
  QUOTE: "Quote",
};

export function BlogSectionsEditorPanel({ sections, onChange }: BlogSectionsEditorPanelProps) {
  function updateSection(index: number, next: BlogSection) {
    onChange(sections.map((section, i) => (i === index ? next : section)));
  }

  function moveSection(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function removeSection(index: number) {
    onChange(sections.filter((_, i) => i !== index));
  }

  function addSection(type: BlogSectionType) {
    onChange([...sections, createEmptyBlogSection(type)]);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-700">Story sections</p>
          <p className="text-xs text-slate-500">
            Build the article with reusable blocks. Legacy body text still works when no sections are saved.
          </p>
        </div>
        <label className="block text-sm font-medium text-slate-700">
          Add section
          <select
            defaultValue=""
            onChange={(event) => {
              const value = event.target.value as BlogSectionType | "";
              if (!value) return;
              addSection(value);
              event.target.value = "";
            }}
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none sm:w-48"
          >
            <option value="">Choose type…</option>
            {BLOG_SECTION_TYPES.map((type) => (
              <option key={type} value={type}>
                {SECTION_LABELS[type]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {sections.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600">
          No sections yet. Add rich text, images, galleries, or quotes to build a visual story.
        </p>
      ) : null}

      {sections.map((section, index) => (
        <div key={section.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900">{SECTION_LABELS[section.type]}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => moveSection(index, -1)}
                disabled={index === 0}
                className="rounded-xl border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 disabled:opacity-40"
              >
                Up
              </button>
              <button
                type="button"
                onClick={() => moveSection(index, 1)}
                disabled={index === sections.length - 1}
                className="rounded-xl border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 disabled:opacity-40"
              >
                Down
              </button>
              <button
                type="button"
                onClick={() => removeSection(index)}
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"
              >
                Remove
              </button>
            </div>
          </div>

          {section.type === "TEXT" || section.type === "IMAGE_TEXT" ? (
            <label className="mb-4 block text-sm font-medium text-slate-700">
              Section title (optional)
              <input
                value={section.title ?? ""}
                onChange={(event) => updateSection(index, { ...section, title: event.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
              />
            </label>
          ) : null}

          {section.type === "TEXT" ? (
            <label className="block text-sm font-medium text-slate-700">
              Paragraphs (blank line separates paragraphs)
              <textarea
                value={section.paragraphs.join("\n\n")}
                onChange={(event) =>
                  updateSection(index, {
                    ...section,
                    paragraphs: event.target.value.split(/\n{2,}/),
                  })
                }
                rows={6}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
              />
            </label>
          ) : null}

          {section.type === "IMAGE" || section.type === "IMAGE_TEXT" ? (
            <div className="space-y-4">
              <ImageUploadField
                label="Section image"
                section="blog"
                value={section.imageUrl}
                onChange={(url) => updateSection(index, { ...section, imageUrl: url })}
                hint={UPLOAD_FILE_HINT}
              />
              <label className="block text-sm font-medium text-slate-700">
                Image alt text
                <input
                  value={section.imageAlt}
                  onChange={(event) => updateSection(index, { ...section, imageAlt: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>
            </div>
          ) : null}

          {section.type === "IMAGE" ? (
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Caption (optional)
              <input
                value={section.caption ?? ""}
                onChange={(event) => updateSection(index, { ...section, caption: event.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
              />
            </label>
          ) : null}

          {section.type === "IMAGE_TEXT" ? (
            <>
              <label className="mt-4 block text-sm font-medium text-slate-700">
                Image side
                <select
                  value={section.imageSide ?? "left"}
                  onChange={(event) =>
                    updateSection(index, {
                      ...section,
                      imageSide: event.target.value as "left" | "right",
                    })
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                >
                  <option value="left">Image left</option>
                  <option value="right">Image right</option>
                </select>
              </label>
              <label className="mt-4 block text-sm font-medium text-slate-700">
                Body text (blank line separates paragraphs)
                <textarea
                  value={section.paragraphs.join("\n\n")}
                  onChange={(event) =>
                    updateSection(index, {
                      ...section,
                      paragraphs: event.target.value.split(/\n{2,}/),
                    })
                  }
                  rows={6}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>
            </>
          ) : null}

          {section.type === "GALLERY" ? (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Gallery title (optional)
                <input
                  value={section.title ?? ""}
                  onChange={(event) => updateSection(index, { ...section, title: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>
              {section.images.map((image, imageIndex) => (
                <div key={`${section.id}-${imageIndex}`} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <ImageUploadField
                    label={`Image ${imageIndex + 1}`}
                    section="blog"
                    value={image.url}
                    onChange={(url) => {
                      const images = [...section.images];
                      images[imageIndex] = { ...images[imageIndex], url };
                      updateSection(index, { ...section, images });
                    }}
                    hint={UPLOAD_FILE_HINT}
                  />
                  <label className="mt-3 block text-sm font-medium text-slate-700">
                    Alt text
                    <input
                      value={image.alt}
                      onChange={(event) => {
                        const images = [...section.images];
                        images[imageIndex] = { ...images[imageIndex], alt: event.target.value };
                        updateSection(index, { ...section, images });
                      }}
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      updateSection(index, {
                        ...section,
                        images: section.images.filter((_, i) => i !== imageIndex),
                      })
                    }
                    className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"
                  >
                    Remove image
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  updateSection(index, {
                    ...section,
                    images: [...section.images, { url: "", alt: "" }],
                  })
                }
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Add gallery image
              </button>
            </div>
          ) : null}

          {section.type === "QUOTE" ? (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Quote
                <textarea
                  value={section.quote}
                  onChange={(event) => updateSection(index, { ...section, quote: event.target.value })}
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Attribution (optional)
                <input
                  value={section.attribution ?? ""}
                  onChange={(event) => updateSection(index, { ...section, attribution: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
