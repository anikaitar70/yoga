"use client";

import type { LocaleContentStore } from "@/lib/i18n/locale-content";

type LocaleContentEditorProps = {
  value: LocaleContentStore;
  onChange: (value: LocaleContentStore) => void;
};

function field(
  label: string,
  value: string,
  onChange: (next: string) => void,
  multiline = false,
) {
  const className = "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm";
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} className={className} rows={3} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className={className} />
      )}
    </label>
  );
}

export function LocaleContentEditor({ value, onChange }: LocaleContentEditorProps) {
  const ja = value.ja ?? {};
  const site = ja.site ?? {};

  function patchJa(patch: Partial<NonNullable<LocaleContentStore["ja"]>>) {
    onChange({ ...value, ja: { ...ja, ...patch } });
  }

  return (
    <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Japanese site name &amp; tagline</h3>
        <p className="mt-1 text-xs text-slate-600">
          Hero and About page copy use English / 日本語 tabs in their own CMS sections. Program page
          sections and homepage blocks still use built-in machine translation until those editors gain
          日本語 tabs.
        </p>
      </div>

      {field("Site name (JA)", site.name ?? "", (name) => patchJa({ site: { ...site, name } }))}
      {field("Tagline (JA)", site.tagline ?? "", (tagline) => patchJa({ site: { ...site, tagline } }), true)}
    </div>
  );
}

export function MachineTranslationNote() {
  return (
    <p className="text-xs text-slate-600">
      Leave 日本語 fields blank to use built-in machine translation on{" "}
      <code className="rounded bg-slate-100 px-1">/ja</code> pages. When you enter Japanese text here, the public site
      uses your copy instead of the automatic translation. A translation notice still appears on{" "}
      <code className="rounded bg-slate-100 px-1">/ja</code> while any part of the page relies on machine translation.
    </p>
  );
}
