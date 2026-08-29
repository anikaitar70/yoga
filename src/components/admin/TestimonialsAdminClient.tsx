"use client";

import { useState } from "react";
import { adminJsonRequest } from "@/lib/admin-fetch";
import { TestimonialManager } from "@/components/admin/TestimonialManager";
import type { AdminTestimonial } from "@/lib/admin-types";
import type { TestimonialsPageSettings } from "@/lib/testimonials-page-settings";
import { translateTextViaApi } from "@/lib/auto-translate";

type Props = {
  initialTestimonials: AdminTestimonial[];
  initialSettings: TestimonialsPageSettings;
};

const inputClass =
  "mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

export default function TestimonialsAdminClient({ initialTestimonials, initialSettings }: Props) {
  const [settings, setSettings] = useState<TestimonialsPageSettings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [translateBusy, setTranslateBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function saveSettings() {
    setSaving(true);
    setMessage(null);
    try {
      await adminJsonRequest("/api/cms/site", "PUT", {
        testimonialsPageSettings: settings,
      });
      setMessage("Testimonials page settings saved.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function translateField(en: string | undefined, field: keyof TestimonialsPageSettings, jaField: keyof TestimonialsPageSettings) {
    if (!en?.trim()) return;
    setTranslateBusy(true);
    try {
      const ja = await translateTextViaApi(en);
      setSettings((prev) => ({ ...prev, [jaField]: ja } as TestimonialsPageSettings));
      setMessage("Translated to Japanese (MACHINE). Review and save.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Translation failed");
    } finally {
      setTranslateBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Page header</h2>
        <p className="mt-1 text-sm text-slate-600">Title and subtitle shown at the top of /testimonials. Leave empty to use defaults. Japanese is generated via Gemini.</p>
        <div className="mt-4 grid gap-4">
          <label className="block text-sm font-medium text-slate-700">
            Header title (EN)
            <input
              value={settings.headerTitle ?? ""}
              onChange={(e) => setSettings({ ...settings, headerTitle: e.target.value || undefined })}
              placeholder="Testimonials"
              className={inputClass}
            />
          </label>
          <div className="flex justify-end">
            <button
              type="button"
              disabled={translateBusy || !settings.headerTitle?.trim()}
              onClick={() => translateField(settings.headerTitle, "headerTitle", "headerTitleJa")}
              className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-900 hover:bg-sky-100 disabled:opacity-50"
            >
              {translateBusy ? "Translating..." : "Translate title to Japanese"}
            </button>
          </div>
          <label className="block text-sm font-medium text-slate-700">
            Header title (JA)
            <input
              value={settings.headerTitleJa ?? ""}
              onChange={(e) => setSettings({ ...settings, headerTitleJa: e.target.value || undefined })}
              placeholder="お客様の声"
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Header subtitle (EN)
            <input
              value={settings.headerSubtitle ?? ""}
              onChange={(e) => setSettings({ ...settings, headerSubtitle: e.target.value || undefined })}
              placeholder="Words from the studio community — shared with permission."
              className={inputClass}
            />
          </label>
          <div className="flex justify-end">
            <button
              type="button"
              disabled={translateBusy || !settings.headerSubtitle?.trim()}
              onClick={() => translateField(settings.headerSubtitle, "headerSubtitle", "headerSubtitleJa")}
              className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-900 hover:bg-sky-100 disabled:opacity-50"
            >
              {translateBusy ? "Translating..." : "Translate subtitle to Japanese"}
            </button>
          </div>
          <label className="block text-sm font-medium text-slate-700">
            Header subtitle (JA)
            <input
              value={settings.headerSubtitleJa ?? ""}
              onChange={(e) => setSettings({ ...settings, headerSubtitleJa: e.target.value || undefined })}
              placeholder="スタジオに寄せられた心あたたまる声をご紹介します。"
              className={inputClass}
            />
          </label>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Layout
            <select
              value={settings.layout}
              onChange={(e) => setSettings({ ...settings, layout: e.target.value as TestimonialsPageSettings["layout"] })}
              className={inputClass}
            >
              <option value="grid">Grid (multiple per row)</option>
              <option value="list">Normal / List (vertical)</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Content width
            <select
              value={settings.contentWidth}
              onChange={(e) => setSettings({ ...settings, contentWidth: e.target.value as TestimonialsPageSettings["contentWidth"] })}
              className={inputClass}
            >
              <option value="narrow">Narrow</option>
              <option value="normal">Normal</option>
              <option value="wide">Wide</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Section spacing (top/bottom)
            <select
              value={settings.sectionSpacing}
              onChange={(e) => setSettings({ ...settings, sectionSpacing: e.target.value as TestimonialsPageSettings["sectionSpacing"] })}
              className={inputClass}
            >
              <option value="none">None</option>
              <option value="default">Default</option>
              <option value="loose">Loose</option>
              <option value="pageHero">Large (hero)</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Card gap (between testimonials)
            <select
              value={settings.cardGap}
              onChange={(e) => setSettings({ ...settings, cardGap: e.target.value as TestimonialsPageSettings["cardGap"] })}
              className={inputClass}
            >
              <option value="compact">Compact (12px)</option>
              <option value="normal">Normal (24px)</option>
              <option value="relaxed">Relaxed (32px)</option>
              <option value="custom">Custom</option>
            </select>
          </label>
          {settings.cardGap === "custom" ? (
            <label className="block text-sm font-medium text-slate-700">
              Custom gap
              <input
                value={settings.cardGapCustom ?? ""}
                onChange={(e) => setSettings({ ...settings, cardGapCustom: e.target.value || undefined })}
                placeholder="e.g. 28px"
                className={inputClass}
              />
            </label>
          ) : null}
        </div>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={saveSettings}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save page settings"}
          </button>
          {message ? <span className="py-3 text-sm text-slate-600">{message}</span> : null}
        </div>
      </div>

      <TestimonialManager initialTestimonials={initialTestimonials} onMessage={setMessage} />
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
