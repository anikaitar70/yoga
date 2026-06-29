"use client";

import { useState } from "react";
import { STATIC_PAGE_PATHS, type StaticPageKey } from "@/lib/seo/page-defaults";
import {
  SeoFieldsEditor,
  emptySeoFormState,
  seoFormToPayload,
  seoFromRecord,
  type SeoFormState,
} from "@/components/admin/SeoFieldsEditor";
import { adminFetch, parseAdminJsonResponse } from "@/lib/admin-fetch";

const PAGE_OPTIONS: { key: StaticPageKey; label: string }[] = [
  { key: "home", label: "Home" },
  { key: "about", label: "About" },
  { key: "yoga", label: "Yoga" },
  { key: "healing", label: "Healing" },
  { key: "just-art-life", label: "Just Art Affaire" },
  { key: "events", label: "Events" },
  { key: "gallery", label: "Gallery" },
  { key: "blog", label: "Blog" },
  { key: "contact", label: "Contact" },
];

type PageSeoManagerProps = {
  initialRecords: Record<string, SeoFormState>;
};

export function PageSeoManager({ initialRecords }: PageSeoManagerProps) {
  const [selected, setSelected] = useState<StaticPageKey>("home");
  const [records, setRecords] = useState(initialRecords);
  const [seoState, setSeoState] = useState<SeoFormState>(
    initialRecords[STATIC_PAGE_PATHS.home] ?? emptySeoFormState,
  );
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  function selectPage(key: StaticPageKey) {
    setSelected(key);
    const path = STATIC_PAGE_PATHS[key];
    setSeoState(records[path] ?? emptySeoFormState);
    setFeedback(null);
  }

  async function savePageSeo(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setFeedback(null);
    const path = STATIC_PAGE_PATHS[selected];

    try {
      const response = await adminFetch("/api/cms/page-seo", {
        method: "PUT",
        body: JSON.stringify({ path, ...seoFormToPayload(seoState) }),
      });
      const parsed = await parseAdminJsonResponse<Record<string, unknown>>(response);
      if (!parsed.ok || !response.ok) {
        setFeedback(parsed.ok ? "Unable to save page SEO." : parsed.error);
        return;
      }
      const saved = seoFromRecord(parsed.data);
      setRecords((current) => ({ ...current, [path]: saved }));
      setFeedback("Page SEO saved.");
    } catch {
      setFeedback("Unable to save page SEO.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Page SEO</h2>
      <p className="mt-1 text-sm text-slate-600">
        Optional overrides for static and program pages. Blank fields use auto-generated defaults.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {PAGE_OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => selectPage(option.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              selected === option.key
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <form className="mt-6 space-y-4" onSubmit={savePageSeo}>
        <SeoFieldsEditor value={seoState} onChange={setSeoState} />
        {feedback ? <p className="text-sm text-slate-600">{feedback}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
        >
          {busy ? "Saving…" : `Save SEO for ${PAGE_OPTIONS.find((p) => p.key === selected)?.label}`}
        </button>
      </form>
    </section>
  );
}
