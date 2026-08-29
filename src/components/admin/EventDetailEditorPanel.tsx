"use client";

import { useState } from "react";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { UPLOAD_FILE_HINT } from "@/lib/upload-limits";
import {
  EVENT_DETAIL_SECTION_TYPES,
  createEmptyEventDetailSection,
  emptyEventDetail,
  emptyEventDetailLocaleJa,
  type EventDetailConfig,
  type EventDetailLocaleContent,
  type EventDetailSection,
  type EventDetailSectionType,
} from "@/lib/event-detail";

type EventDetailEditorPanelProps = {
  value: EventDetailConfig;
  onChange: (value: EventDetailConfig) => void;
  onPreview?: () => void;
  previewLocale?: "en" | "ja";
  onPreviewLocaleChange?: (locale: "en" | "ja") => void;
};

type DetailLocale = "en" | "ja";

const SECTION_LABELS: Record<EventDetailSectionType, string> = {
  TEXT: "Text only",
  IMAGE: "Full-width image",
  IMAGE_TEXT: "Image + text",
};

export function EventDetailEditorPanel({
  value,
  onChange,
  onPreview,
  previewLocale = "en",
  onPreviewLocaleChange,
}: EventDetailEditorPanelProps) {
  const [activeLocale, setActiveLocale] = useState<DetailLocale>("en");
  const detail = value ?? emptyEventDetail();

  function update(partial: Partial<EventDetailConfig>) {
    onChange({ ...detail, ...partial });
  }

  function localeContent(): EventDetailLocaleContent {
    if (activeLocale === "en") return detail.en;
    return detail.ja ?? emptyEventDetailLocaleJa();
  }

  function updateLocaleContent(next: EventDetailLocaleContent) {
    if (activeLocale === "en") {
      update({ en: next });
      return;
    }
    update({ ja: next });
  }

  function updateSection(index: number, next: EventDetailSection) {
    const content = localeContent();
    updateLocaleContent({
      ...content,
      sections: content.sections.map((section, i) => (i === index ? next : section)),
    });
  }

  function moveSection(index: number, direction: -1 | 1) {
    const content = localeContent();
    const target = index + direction;
    if (target < 0 || target >= content.sections.length) return;
    const next = [...content.sections];
    [next[index], next[target]] = [next[target], next[index]];
    updateLocaleContent({ ...content, sections: next });
  }

  function removeSection(index: number) {
    const content = localeContent();
    updateLocaleContent({
      ...content,
      sections: content.sections.filter((_, i) => i !== index),
    });
  }

  function addSection(type: EventDetailSectionType) {
    const content = localeContent();
    updateLocaleContent({
      ...content,
      sections: [...content.sections, createEmptyEventDetailSection(type)],
    });
  }

  const content = localeContent();
  const registration = content.registration ?? {
    enabled: false,
    label: activeLocale === "ja" ? "このイベントに登録する" : "Register for this Event",
    googleFormUrl: "",
  };

  return (
    <div className="space-y-5 rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Event Details / Read More</p>
          <p className="mt-1 text-xs text-slate-500">
            Build a large information panel that opens from the event card. Edit English and Japanese
            content separately.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {onPreview ? (
            <button
              type="button"
              onClick={onPreview}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
            >
              Preview panel
            </button>
          ) : null}
          {onPreviewLocaleChange ? (
            <div className="inline-flex rounded-xl border border-slate-300 bg-white p-0.5 text-xs font-semibold">
              {(["en", "ja"] as const).map((locale) => (
                <button
                  key={locale}
                  type="button"
                  onClick={() => onPreviewLocaleChange(locale)}
                  className={`rounded-lg px-3 py-1.5 ${
                    previewLocale === locale ? "bg-slate-900 text-white" : "text-slate-700"
                  }`}
                >
                  {locale === "en" ? "Preview EN" : "Preview JA"}
                </button>
              ))}
            </div>
          ) : null}
          <label className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={detail.enabled}
              onChange={(event) => update({ enabled: event.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-slate-900"
            />
            Enable Read More
          </label>
        </div>
      </div>

      <div className="inline-flex rounded-2xl border border-slate-300 bg-white p-1 text-sm font-semibold">
        {(["en", "ja"] as const).map((locale) => (
          <button
            key={locale}
            type="button"
            onClick={() => setActiveLocale(locale)}
            className={`rounded-xl px-4 py-2 ${
              activeLocale === locale ? "bg-slate-900 text-white" : "text-slate-700"
            }`}
          >
            {locale === "en" ? "English" : "日本語"}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-500">
        {activeLocale === "ja"
          ? "Japanese visitors see this content when translation status is Human reviewed. While status is Machine translated, automatic Japanese is shown until you fill this tab."
          : "English content shown to visitors browsing in English."}
      </p>

      <label className="block text-sm font-medium text-slate-700">
        Subtitle / eyebrow (optional)
        <input
          value={content.subtitle ?? ""}
          onChange={(event) => updateLocaleContent({ ...content, subtitle: event.target.value })}
          placeholder={activeLocale === "ja" ? "週末イマージョン · 箱根" : "Weekend immersion · Hakone"}
          className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-700">Content sections</p>
          <p className="text-xs text-slate-500">Stack text and images. Reorder with Up / Down.</p>
        </div>
        <label className="block text-sm font-medium text-slate-700">
          Add section
          <select
            defaultValue=""
            onChange={(event) => {
              const nextType = event.target.value as EventDetailSectionType | "";
              if (!nextType) return;
              addSection(nextType);
              event.target.value = "";
            }}
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none sm:w-52"
          >
            <option value="">Choose type…</option>
            {EVENT_DETAIL_SECTION_TYPES.map((type) => (
              <option key={type} value={type}>
                {SECTION_LABELS[type]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {content.sections.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-600">
          No sections yet for {activeLocale === "ja" ? "Japanese" : "English"}. Add text, a full-width
          image, or an image + text layout.
        </p>
      ) : null}

      {content.sections.map((section, index) => (
        <div key={section.id} className="rounded-2xl border border-slate-200 bg-white p-4">
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
                disabled={index === content.sections.length - 1}
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
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
              />
            </label>
          ) : null}

          {section.type === "TEXT" ? (
            <RichTextEditor
              label="Body"
              value={section.paragraphs.join("\n\n")}
              onChange={(html) => updateSection(index, { ...section, paragraphs: [html] })}
              minHeight={110}
            />
          ) : null}

          {section.type === "IMAGE" || section.type === "IMAGE_TEXT" ? (
            <div className="space-y-4">
              <ImageUploadField
                label="Section image"
                section="events"
                value={section.imageUrl}
                onChange={(url) => updateSection(index, { ...section, imageUrl: url })}
                hint={UPLOAD_FILE_HINT}
              />
              <label className="block text-sm font-medium text-slate-700">
                Image alt text
                <input
                  value={section.imageAlt}
                  onChange={(event) => updateSection(index, { ...section, imageAlt: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
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
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
              />
            </label>
          ) : null}

          {section.type === "IMAGE_TEXT" ? (
            <div className="mt-4 space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Image position
                <select
                  value={section.imagePosition ?? "left"}
                  onChange={(event) =>
                    updateSection(index, {
                      ...section,
                      imagePosition: event.target.value as "left" | "right" | "full",
                    })
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                >
                  <option value="left">Image left / text right</option>
                  <option value="right">Image right / text left</option>
                  <option value="full">Full-width image above text</option>
                </select>
              </label>
              <RichTextEditor
                label="Body"
                value={section.paragraphs.join("\n\n")}
                onChange={(html) => updateSection(index, { ...section, paragraphs: [html] })}
                minHeight={110}
              />
            </div>
          ) : null}
        </div>
      ))}

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">Registration CTA (Google Form)</p>
        <p className="mt-1 text-xs text-slate-500">
          Optional button at the bottom of the Read More panel. Opens in a new tab. Separate from the
          external event link on the card.
        </p>
        <label className="mt-4 inline-flex items-center gap-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={registration.enabled}
            onChange={(event) =>
              updateLocaleContent({
                ...content,
                registration: { ...registration, enabled: event.target.checked },
              })
            }
            className="h-5 w-5 rounded border-slate-300 text-slate-900"
          />
          Show registration CTA
        </label>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            CTA label
            <input
              value={registration.label}
              onChange={(event) =>
                updateLocaleContent({
                  ...content,
                  registration: { ...registration, label: event.target.value },
                })
              }
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Google Form URL (HTTPS)
            <input
              value={registration.googleFormUrl}
              onChange={(event) =>
                updateLocaleContent({
                  ...content,
                  registration: { ...registration, googleFormUrl: event.target.value },
                })
              }
              placeholder="https://forms.gle/…"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
            />
          </label>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Google Form URL is shared across languages. Enable and set the URL in either language tab.
        </p>
      </div>
    </div>
  );
}
