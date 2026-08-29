"use client";

import { useState } from "react";
import Image from "next/image";
import type { AdminTestimonial } from "@/lib/admin-types";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { LocaleEditorTabs, type EditorLocale } from "@/components/admin/LocaleEditorTabs";
import { MachineTranslationNote } from "@/components/admin/LocaleContentEditor";
import type { TestimonialJaLocale } from "@/lib/testimonial-locale";
import { translateTextViaApi } from "@/lib/auto-translate";

type OCRReviewPanelProps = {
  form: AdminTestimonial;
  jaLocale: TestimonialJaLocale;
  contentLocale: EditorLocale;
  onLocaleChange: (locale: EditorLocale) => void;
  onJaLocaleChange: (locale: TestimonialJaLocale) => void;
  ocrBusy: boolean;
  ocrError?: string | null;
  saving: boolean;
  onChange: (form: AdminTestimonial) => void;
  onImageUpload: (imageUrl: string) => void | Promise<void>;
  onRerunOcr: () => void | Promise<void>;
  onSave: () => void | Promise<void>;
  onClear: () => void;
  onDelete?: () => void | Promise<void>;
};

export function OCRReviewPanel({
  form,
  jaLocale,
  contentLocale,
  onLocaleChange,
  onJaLocaleChange,
  ocrBusy,
  ocrError,
  saving,
  onChange,
  onImageUpload,
  onRerunOcr,
  onSave,
  onClear,
  onDelete,
}: OCRReviewPanelProps) {
  const [translateBusy, setTranslateBusy] = useState(false);
  const [translateMessage, setTranslateMessage] = useState<string | null>(null);

  async function handleTranslateAll() {
    if (!form.quote?.trim() && !form.name?.trim() && !form.role?.trim() && !form.city?.trim() && !form.country?.trim()) {
      setTranslateMessage("Nothing to translate — add English content first.");
      return;
    }
    setTranslateBusy(true);
    setTranslateMessage(null);
    try {
      const [jaQuote, jaName, jaRole, jaCity, jaCountry] = await Promise.all([
        form.quote?.trim() ? translateTextViaApi(form.quote) : Promise.resolve(""),
        form.name?.trim() ? translateTextViaApi(form.name) : Promise.resolve(""),
        form.role?.trim() ? translateTextViaApi(form.role) : Promise.resolve(""),
        form.city?.trim() ? translateTextViaApi(form.city) : Promise.resolve(""),
        form.country?.trim() ? translateTextViaApi(form.country) : Promise.resolve(""),
      ]);
      const nextJa: TestimonialJaLocale = { ...jaLocale };
      if (jaQuote) nextJa.quote = jaQuote;
      if (jaName) nextJa.name = jaName;
      if (jaRole) nextJa.role = jaRole;
      if (jaCity) nextJa.city = jaCity;
      if (jaCountry) nextJa.country = jaCountry;
      onJaLocaleChange(nextJa);
      setTranslateMessage("Translated to Japanese (MACHINE). Review and save. Save will mark as machine-translated until reviewed.");
    } catch (e) {
      setTranslateMessage(e instanceof Error ? e.message : "Translation failed");
    } finally {
      setTranslateBusy(false);
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Testimonial editor</h2>
      <p className="mt-1 text-sm text-slate-600">
        Upload a screenshot — text is extracted automatically. Review and correct before saving.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">Edit English or 日本語 display text.</p>
        <LocaleEditorTabs activeLocale={contentLocale} onChange={onLocaleChange} />
      </div>
      <MachineTranslationNote />
      {contentLocale === "en" ? (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={translateBusy || saving || ocrBusy}
            onClick={() => void handleTranslateAll()}
            className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-semibold text-sky-900 hover:bg-sky-100 disabled:opacity-50"
          >
            {translateBusy ? "Translating..." : "Translate to Japanese (Gemini)"}
          </button>
          {translateMessage ? <span className="text-xs text-slate-600">{translateMessage}</span> : null}
        </div>
      ) : null}

      <div className="mt-4 space-y-4">
        <ImageUploadField
          label="Testimonial image (screenshot)"
          section="testimonials"
          value={form.imageUrl ?? ""}
          onChange={onImageUpload}
        />

        {ocrBusy ? (
          <p className="text-sm text-slate-600" role="status">
            Running OCR… this can take up to a minute on the first image.
          </p>
        ) : null}

        {ocrError ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950" role="alert">
            {ocrError}
          </p>
        ) : null}

        {form.ocrConfidence != null ? (
          <p className="text-xs text-slate-500">
            OCR confidence: {Math.round(form.ocrConfidence)}%
            {form.imageUrl ? (
              <button
                type="button"
                onClick={() => void onRerunOcr()}
                disabled={ocrBusy || saving}
                className="ml-3 font-medium text-slate-700 underline-offset-2 hover:underline disabled:opacity-50"
              >
                Re-run OCR
              </button>
            ) : null}
          </p>
        ) : null}

        {form.imageUrl ? (
          <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">Original screenshot</p>
              <p className="mt-1 text-xs text-slate-500">CMS review only — not shown on the public site.</p>
              <div className="relative mt-3 aspect-[3/4] overflow-hidden rounded-xl border border-slate-200 bg-white">
                <Image
                  src={form.imageUrl}
                  alt={form.imageAlt || "Original testimonial screenshot"}
                  fill
                  className="object-contain p-2"
                  unoptimized={form.imageUrl.startsWith("/uploads/")}
                />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Handwritten display preview</p>
              <p className="mt-1 text-xs text-slate-500">How the approved quote appears to visitors.</p>
              <div className="journal-entry mt-3 rounded-xl border border-primary/15 bg-[#faf6ef] p-4">
                <p className="font-handwritten text-lg leading-relaxed text-foreground/90">
                  {form.quote || form.extractedText || "Add or extract text to preview."}
                </p>
                {form.name ? (
                  <p className="mt-4 border-t border-primary/15 pt-3 font-display text-sm text-foreground">
                    {form.name}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {contentLocale === "en" ? (
          <>
        <label htmlFor="testimonial-name" className="block text-sm font-medium text-slate-700">
          Name
        </label>
        <input
          id="testimonial-name"
          value={form.name}
          onChange={(event) => onChange({ ...form, name: event.target.value })}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
        />

        <label htmlFor="testimonial-role" className="block text-sm font-medium text-slate-700">
          Role
        </label>
        <input
          id="testimonial-role"
          value={form.role}
          onChange={(event) => onChange({ ...form, role: event.target.value })}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="testimonial-city" className="block text-sm font-medium text-slate-700">
              City
            </label>
            <input
              id="testimonial-city"
              value={form.city ?? ""}
              onChange={(event) => onChange({ ...form, city: event.target.value })}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label htmlFor="testimonial-country" className="block text-sm font-medium text-slate-700">
              Country
            </label>
            <input
              id="testimonial-country"
              value={form.country ?? ""}
              onChange={(event) => onChange({ ...form, country: event.target.value })}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            />
          </div>
        </div>

        <label htmlFor="testimonial-quote" className="block text-sm font-medium text-slate-700">
          Quote (editable display text)
        </label>
        <textarea
          id="testimonial-quote"
          value={form.quote}
          onChange={(event) => onChange({ ...form, quote: event.target.value })}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
          rows={5}
        />
          </>
        ) : (
          <>
        <label className="block text-sm font-medium text-slate-700">
          Name (日本語)
          <input
            value={jaLocale.name ?? ""}
            onChange={(event) => onJaLocaleChange({ ...jaLocale, name: event.target.value })}
            placeholder={form.name}
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Role (日本語)
          <input
            value={jaLocale.role ?? ""}
            onChange={(event) => onJaLocaleChange({ ...jaLocale, role: event.target.value })}
            placeholder={form.role}
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            City (日本語)
            <input
              value={jaLocale.city ?? ""}
              onChange={(event) => onJaLocaleChange({ ...jaLocale, city: event.target.value })}
              placeholder={form.city ?? ""}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Country (日本語)
            <input
              value={jaLocale.country ?? ""}
              onChange={(event) => onJaLocaleChange({ ...jaLocale, country: event.target.value })}
              placeholder={form.country ?? ""}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            />
          </label>
        </div>
        <label className="block text-sm font-medium text-slate-700">
          Quote (日本語)
          <textarea
            value={jaLocale.quote ?? ""}
            onChange={(event) => onJaLocaleChange({ ...jaLocale, quote: event.target.value })}
            placeholder={form.quote}
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            rows={5}
          />
        </label>
          </>
        )}

        {contentLocale === "en" ? (
          <>
        <label htmlFor="testimonial-extracted" className="block text-sm font-medium text-slate-700">
          Extracted OCR text (raw)
        </label>
        <textarea
          id="testimonial-extracted"
          value={form.extractedText ?? ""}
          onChange={(event) => onChange({ ...form, extractedText: event.target.value })}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600"
          rows={4}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="testimonial-display" className="block text-sm font-medium text-slate-700">
              Display style
            </label>
            <select
              id="testimonial-display"
              value={form.displayStyle ?? "handwritten"}
              onChange={(event) =>
                onChange({
                  ...form,
                  displayStyle: event.target.value as AdminTestimonial["displayStyle"],
                })
              }
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            >
              <option value="handwritten">Handwritten journal</option>
              <option value="card">Standard card</option>
            </select>
          </div>
          <div>
            <label htmlFor="testimonial-status" className="block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              id="testimonial-status"
              value={form.status}
              onChange={(event) =>
                onChange({
                  ...form,
                  status: event.target.value as AdminTestimonial["status"],
                })
              }
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            >
              <option value="pending">Pending review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.featured ?? false}
            onChange={(event) => onChange({ ...form, featured: event.target.checked })}
            className="rounded border-slate-300"
          />
          Featured testimonial
        </label>
          </>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={() => void onSave()}
          className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {form.id ? "Update testimonial" : "Add testimonial"}
        </button>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Clear
        </button>
        {form.id && onDelete ? (
          <button
            type="button"
            disabled={saving}
            onClick={() => void onDelete()}
            className="inline-flex items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
          >
            Delete
          </button>
        ) : null}
      </div>
    </div>
  );
}
