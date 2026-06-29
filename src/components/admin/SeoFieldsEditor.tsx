"use client";

export type SeoFormState = {
  seoTitle: string;
  metaDescription: string;
  ogImageUrl: string;
  canonicalUrlOverride: string;
  focusKeywords: string;
  jaTranslationStatus: "MACHINE" | "HUMAN_REVIEWED";
  coverImageAlt?: string;
  imageAlt?: string;
};

export const emptySeoFormState: SeoFormState = {
  seoTitle: "",
  metaDescription: "",
  ogImageUrl: "",
  canonicalUrlOverride: "",
  focusKeywords: "",
  jaTranslationStatus: "MACHINE",
  coverImageAlt: "",
  imageAlt: "",
};

type SeoFieldsEditorProps = {
  value: SeoFormState;
  onChange: (value: SeoFormState) => void;
  showImageAlt?: boolean;
  imageAltLabel?: string;
};

export function SeoFieldsEditor({
  value,
  onChange,
  showImageAlt,
  imageAltLabel = "Cover image alt text",
}: SeoFieldsEditorProps) {
  function patch(partial: Partial<SeoFormState>) {
    onChange({ ...value, ...partial });
  }

  return (
    <fieldset className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <legend className="px-1 text-sm font-semibold text-slate-900">SEO &amp; discoverability</legend>
      <p className="text-xs text-slate-500">
        Leave blank to auto-generate from title and summary. Japanese translation status controls the machine-translation notice.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          SEO title
          <input
            value={value.seoTitle}
            onChange={(e) => patch({ seoTitle: e.target.value })}
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
            placeholder="Optional override"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Focus keywords
          <input
            value={value.focusKeywords}
            onChange={(e) => patch({ focusKeywords: e.target.value })}
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
            placeholder="yoga, meditation, japan"
          />
        </label>
      </div>

      <label className="block text-sm font-medium text-slate-700">
        Meta description
        <textarea
          value={value.metaDescription}
          onChange={(e) => patch({ metaDescription: e.target.value })}
          rows={2}
          className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
          placeholder="Optional — used for search and social previews"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          OG image URL
          <input
            value={value.ogImageUrl}
            onChange={(e) => patch({ ogImageUrl: e.target.value })}
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
            placeholder="Optional social share image"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Canonical URL override
          <input
            value={value.canonicalUrlOverride}
            onChange={(e) => patch({ canonicalUrlOverride: e.target.value })}
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
            placeholder="https://..."
          />
        </label>
      </div>

      {showImageAlt ? (
        <label className="block text-sm font-medium text-slate-700">
          {imageAltLabel}
          <input
            value={value.coverImageAlt ?? value.imageAlt ?? ""}
            onChange={(e) =>
              patch(
                imageAltLabel.toLowerCase().includes("cover")
                  ? { coverImageAlt: e.target.value }
                  : { imageAlt: e.target.value },
              )
            }
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
          />
        </label>
      ) : null}

      <label className="block text-sm font-medium text-slate-700">
        Japanese translation review
        <select
          value={value.jaTranslationStatus}
          onChange={(e) =>
            patch({ jaTranslationStatus: e.target.value as SeoFormState["jaTranslationStatus"] })
          }
          className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
        >
          <option value="MACHINE">Machine translated — show disclaimer</option>
          <option value="HUMAN_REVIEWED">Human reviewed — hide disclaimer</option>
        </select>
      </label>
    </fieldset>
  );
}

export function seoFormToPayload(value: SeoFormState) {
  return {
    seoTitle: value.seoTitle.trim() || undefined,
    metaDescription: value.metaDescription.trim() || undefined,
    ogImageUrl: value.ogImageUrl.trim() || undefined,
    canonicalUrlOverride: value.canonicalUrlOverride.trim() || undefined,
    focusKeywords: value.focusKeywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
    jaTranslationStatus: value.jaTranslationStatus,
    ...(value.coverImageAlt !== undefined
      ? { coverImageAlt: value.coverImageAlt.trim() || undefined }
      : {}),
    ...(value.imageAlt !== undefined ? { imageAlt: value.imageAlt.trim() || undefined } : {}),
  };
}

export function seoFromRecord(record: Record<string, unknown>): SeoFormState {
  return {
    seoTitle: String(record.seoTitle ?? ""),
    metaDescription: String(record.metaDescription ?? ""),
    ogImageUrl: String(record.ogImageUrl ?? ""),
    canonicalUrlOverride: String(record.canonicalUrlOverride ?? ""),
    focusKeywords: Array.isArray(record.focusKeywords)
      ? record.focusKeywords.join(", ")
      : String(record.focusKeywords ?? ""),
    jaTranslationStatus:
      record.jaTranslationStatus === "HUMAN_REVIEWED" ? "HUMAN_REVIEWED" : "MACHINE",
    coverImageAlt: String(record.coverImageAlt ?? ""),
    imageAlt: String(record.imageAlt ?? ""),
  };
}
