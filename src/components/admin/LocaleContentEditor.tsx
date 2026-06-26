"use client";

import type { LocaleContentStore } from "@/lib/i18n/locale-content";
import { JA_DEFAULT_BUNDLE } from "@/lib/i18n/translations/ja";

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
  const hero = ja.hero ?? {};
  const site = ja.site ?? {};

  function patchJa(patch: Partial<NonNullable<LocaleContentStore["ja"]>>) {
    onChange({ ...value, ja: { ...ja, ...patch } });
  }

  return (
    <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Japanese (日本語) overrides</h3>
        <p className="mt-1 text-xs text-slate-600">
          Leave blank to use built-in Japanese defaults. Visitors switch language via the header on{" "}
          <code className="rounded bg-white px-1">/ja</code> URLs.
        </p>
      </div>

      {field("Site name (JA)", site.name ?? "", (name) => patchJa({ site: { ...site, name } }))}
      {field("Tagline (JA)", site.tagline ?? "", (tagline) => patchJa({ site: { ...site, tagline } }), true)}
      {field("Hero title (JA)", hero.title ?? "", (title) => patchJa({ hero: { ...hero, title } }))}
      {field(
        "Hero subtitle (JA)",
        hero.subtitle ?? "",
        (subtitle) => patchJa({ hero: { ...hero, subtitle } }),
        true,
      )}
      {field(
        "Primary button (JA)",
        hero.primaryCtaLabel ?? "",
        (primaryCtaLabel) => patchJa({ hero: { ...hero, primaryCtaLabel } }),
      )}
      {field(
        "Secondary button (JA)",
        hero.secondaryCtaLabel ?? "",
        (secondaryCtaLabel) => patchJa({ hero: { ...hero, secondaryCtaLabel } }),
      )}

      <details className="text-xs text-slate-600">
        <summary className="cursor-pointer font-medium text-slate-700">Preview built-in defaults</summary>
        <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-white p-3 text-[11px] leading-relaxed">
          {JSON.stringify(JA_DEFAULT_BUNDLE.site, null, 2)}
        </pre>
      </details>
    </div>
  );
}
