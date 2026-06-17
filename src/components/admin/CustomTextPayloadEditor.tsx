"use client";

import type { CustomTextSectionPayload, PageType } from "@/lib/page-section-types";
import { CUSTOM_TEXT_VARIANTS_BY_PAGE } from "@/lib/custom-text-variants";
import { splitJourneyParagraphs } from "@/lib/custom-text-payload";
import { formatTimelineSequenceNumber } from "@/lib/timeline-style";
import {
  isTimelineCustomTextVariant,
  TimelineStyleEditor,
} from "@/components/admin/TimelineStyleEditor";
import type { TimelineStyleScope } from "@/lib/timeline-style";

const inputClass =
  "mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

const VARIANT_LABELS: Record<NonNullable<CustomTextSectionPayload["variant"]>, string> = {
  default: "Default — simple paragraphs",
  "yoga-journey": "Yoga journey — sutra callout",
  "healing-journey": "Healing journey — side timeline + callouts",
  "art-journey": "Art journey — numbered timeline + callouts",
  "experience-timeline": "Experience timeline — year, title, and body rows",
  philosophy: "Philosophy — multiple sutra passages",
};

type Props = {
  pageType: PageType;
  payload: Record<string, unknown>;
  onChange: (payload: Record<string, unknown>) => void;
};

function asPayload(payload: Record<string, unknown>): CustomTextSectionPayload {
  return payload as CustomTextSectionPayload;
}

export function CustomTextPayloadEditor({ pageType, payload, onChange }: Props) {
  const data = asPayload(payload);
  const variant = data.variant ?? "default";
  const allowedVariants = CUSTOM_TEXT_VARIANTS_BY_PAGE[pageType];
  const paragraphs = data.paragraphs ?? [];
  const highlights = data.highlights ?? [];
  const timelineItems = data.timeline?.items ?? [];
  const sutras = data.sutras ?? [];
  const timelineMode = data.timeline?.mode ?? (timelineItems.some((item) => item.text?.trim()) ? "manual" : "linked");
  const introCount = data.introParagraphCount ?? 2;
  const closingCount =
    data.closingParagraphCount ?? (variant === "art-journey" ? 1 : variant === "yoga-journey" ? 1 : 2);

  function patch(next: Partial<CustomTextSectionPayload>) {
    onChange({ ...payload, ...next });
  }

  function setParagraphs(nextParagraphs: string[]) {
    patch({ paragraphs: nextParagraphs });
  }

  function importTimelineFromParagraphs() {
    const { body } = splitJourneyParagraphs(paragraphs, introCount, closingCount);
    patch({
      timeline: {
        enabled: true,
        mode: "manual",
        items: body.map((text) => ({ number: "", text })),
      },
    });
  }

  function convertTimelineToLinked() {
    if (
      !window.confirm(
        "Switch to linked timeline? Paragraph text will drive the timeline. Manual timeline rows are kept in the payload but ignored while linked mode is active.",
      )
    ) {
      return;
    }
    patch({
      timeline: {
        ...data.timeline,
        enabled: true,
        mode: "linked",
        items: timelineItems,
      },
    });
  }

  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 p-4">
      <div>
        <p className="text-sm font-semibold text-slate-800">Custom text layout</p>
        <p className="mt-1 text-xs text-slate-500">
          Paragraphs below are the preferred source of text. Legacy body text is synced on save and still
          renders when paragraphs are empty.
        </p>
      </div>

      <label className="block text-sm font-medium text-slate-700">
        Layout variant
        <select
          value={variant}
          onChange={(e) => {
            const nextVariant = e.target.value as CustomTextSectionPayload["variant"];
            const next: Partial<CustomTextSectionPayload> = { variant: nextVariant };
            if (nextVariant === "art-journey" && !data.timeline) {
              next.timeline = { enabled: true, mode: "linked" };
            }
            if (nextVariant === "experience-timeline" && !data.timeline?.items?.length) {
              next.timeline = {
                enabled: true,
                mode: "manual",
                items: [{ number: "", title: "", text: "" }],
              };
            }
            if (nextVariant === "philosophy" && !data.sutras?.length) {
              next.sutras = [
                {
                  sanskrit: "",
                  transliteration: "",
                  translation: "",
                  source: "",
                  interpretation: "",
                },
              ];
            }
            patch(next);
          }}
          className={inputClass}
        >
          {allowedVariants.map((option) => (
            <option key={option} value={option}>
              {VARIANT_LABELS[option]}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Paragraphs (separate with a blank line)
        <textarea
          rows={10}
          className={inputClass}
          value={paragraphs.join("\n\n")}
          onChange={(e) =>
            setParagraphs(
              e.target.value
                .split(/\n{2,}/)
                .map((p) => p.trim())
                .filter(Boolean),
            )
          }
        />
      </label>

      {variant !== "default" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Intro paragraph count
            <input
              type="number"
              min={0}
              value={introCount}
              onChange={(e) => patch({ introParagraphCount: Number(e.target.value) || 0 })}
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Closing paragraph count
            <input
              type="number"
              min={0}
              value={closingCount}
              onChange={(e) => patch({ closingParagraphCount: Number(e.target.value) || 0 })}
              className={inputClass}
            />
          </label>
        </div>
      ) : null}

      {variant === "yoga-journey" ? (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
            <input
              type="checkbox"
              checked={data.sutraEnabled !== false && data.sutra?.enabled !== false}
              onChange={(e) =>
                patch({
                  sutraEnabled: e.target.checked,
                  sutra: data.sutra ?? {
                    sanskrit: "",
                    transliteration: "",
                    translation: "",
                    source: "",
                    interpretation: "",
                    enabled: true,
                  },
                })
              }
            />
            Show sutra callout box
          </label>
          {data.sutraEnabled !== false && data.sutra?.enabled !== false ? (
            <div className="space-y-3">
              <input
                placeholder="Sanskrit"
                value={data.sutra?.sanskrit ?? ""}
                onChange={(e) => patch({ sutra: { ...data.sutra, sanskrit: e.target.value } as CustomTextSectionPayload["sutra"] })}
                className={inputClass}
              />
              <input
                placeholder="Transliteration"
                value={data.sutra?.transliteration ?? ""}
                onChange={(e) =>
                  patch({ sutra: { ...data.sutra, transliteration: e.target.value } as CustomTextSectionPayload["sutra"] })
                }
                className={inputClass}
              />
              <textarea
                placeholder="Translation"
                rows={2}
                value={data.sutra?.translation ?? ""}
                onChange={(e) =>
                  patch({ sutra: { ...data.sutra, translation: e.target.value } as CustomTextSectionPayload["sutra"] })
                }
                className={inputClass}
              />
              <input
                placeholder="Source (e.g. Patanjali Yoga Sutra 1.12)"
                value={data.sutra?.source ?? ""}
                onChange={(e) => patch({ sutra: { ...data.sutra, source: e.target.value } as CustomTextSectionPayload["sutra"] })}
                className={inputClass}
              />
              <textarea
                placeholder="Interpretation (optional)"
                rows={2}
                value={data.sutra?.interpretation ?? ""}
                onChange={(e) =>
                  patch({ sutra: { ...data.sutra, interpretation: e.target.value } as CustomTextSectionPayload["sutra"] })
                }
                className={inputClass}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {variant === "art-journey" ? (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={data.timeline?.enabled !== false}
                onChange={(e) =>
                  patch({
                    timeline: {
                      ...data.timeline,
                      enabled: e.target.checked,
                      mode: timelineMode,
                      items: timelineItems,
                    },
                  })
                }
              />
              Show numbered timeline
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white"
                onClick={importTimelineFromParagraphs}
              >
                Import from paragraphs
              </button>
              {timelineMode === "manual" ? (
                <button
                  type="button"
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white"
                  onClick={convertTimelineToLinked}
                >
                  Convert manual → linked
                </button>
              ) : null}
            </div>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-slate-700">Timeline mode</legend>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name="timeline-mode"
                checked={timelineMode === "linked"}
                onChange={() =>
                  patch({
                    timeline: { ...data.timeline, enabled: true, mode: "linked", items: timelineItems },
                  })
                }
              />
              Linked — numbers and text come from journey paragraphs
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name="timeline-mode"
                checked={timelineMode === "manual"}
                onChange={() =>
                  patch({
                    timeline: { ...data.timeline, enabled: true, mode: "manual", items: timelineItems },
                  })
                }
              />
              Manual — edit each timeline row below
            </label>
          </fieldset>

          {data.timeline?.enabled !== false && timelineMode === "manual" ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Numbers are assigned automatically from 01 in display order. Reorder or remove rows below —
                numbering updates on save and on the live site.
              </p>
              {timelineItems.map((item, index) => (
                <div key={index} className="grid gap-2 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-[4rem_1fr_auto]">
                  <div className="flex items-center justify-center rounded-xl bg-slate-100 px-2 py-3 text-center font-display text-lg font-semibold text-slate-800">
                    {formatTimelineSequenceNumber(index)}
                  </div>
                  <textarea
                    placeholder="Timeline text"
                    rows={2}
                    value={item.text}
                    onChange={(e) => {
                      const items = [...timelineItems];
                      items[index] = { ...items[index], text: e.target.value, number: "" };
                      patch({ timeline: { ...data.timeline, enabled: true, mode: "manual", items } });
                    }}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    className="self-start text-xs text-red-600"
                    onClick={() => {
                      const items = timelineItems.filter((_, i) => i !== index);
                      patch({ timeline: { ...data.timeline, enabled: true, mode: "manual", items } });
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                onClick={() =>
                  patch({
                    timeline: {
                      enabled: true,
                      mode: "manual",
                      items: [...timelineItems, { number: "", text: "" }],
                    },
                  })
                }
              >
                + Add timeline row
              </button>
            </div>
          ) : null}

          {data.timeline?.enabled !== false && timelineMode === "linked" ? (
            <p className="text-xs text-slate-500">
              Linked mode uses body paragraphs (after intro, before closing) for timeline text. Adjust intro
              and closing counts above to control which paragraphs appear in the timeline.
            </p>
          ) : null}
        </div>
      ) : null}

      {variant === "experience-timeline" ? (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-xs text-slate-500">
            Set the section title above to the timeline heading (e.g. Journey &amp; experience). Each row uses
            number as the year label, title as the milestone heading, and text as the body.
          </p>
          <div className="space-y-3">
            {timelineItems.map((item, index) => (
              <div key={index} className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
                <input
                  placeholder="Year label (e.g. Foundations)"
                  value={item.number}
                  onChange={(e) => {
                    const items = [...timelineItems];
                    items[index] = { ...items[index], number: e.target.value };
                    patch({ timeline: { enabled: true, mode: "manual", items } });
                  }}
                  className={inputClass}
                />
                <input
                  placeholder="Milestone title"
                  value={item.title ?? ""}
                  onChange={(e) => {
                    const items = [...timelineItems];
                    items[index] = { ...items[index], title: e.target.value };
                    patch({ timeline: { enabled: true, mode: "manual", items } });
                  }}
                  className={inputClass}
                />
                <textarea
                  placeholder="Body text"
                  rows={3}
                  value={item.text}
                  onChange={(e) => {
                    const items = [...timelineItems];
                    items[index] = { ...items[index], text: e.target.value };
                    patch({ timeline: { enabled: true, mode: "manual", items } });
                  }}
                  className={inputClass}
                />
                <button
                  type="button"
                  className="text-xs text-red-600"
                  onClick={() => {
                    const items = timelineItems.filter((_, i) => i !== index);
                    patch({ timeline: { enabled: true, mode: "manual", items } });
                  }}
                >
                  Remove row
                </button>
              </div>
            ))}
            <button
              type="button"
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
              onClick={() =>
                patch({
                  timeline: {
                    enabled: true,
                    mode: "manual",
                    items: [...timelineItems, { number: "", title: "", text: "" }],
                  },
                })
              }
            >
              + Add timeline row
            </button>
          </div>
        </div>
      ) : null}

      {variant === "philosophy" ? (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-xs text-slate-500">
            Set the section title above to the philosophy heading (e.g. Teaching philosophy).
          </p>
          <div className="space-y-4">
            {sutras.map((sutra, index) => (
              <div key={index} className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
                <input
                  placeholder="Sanskrit"
                  value={sutra.sanskrit ?? ""}
                  onChange={(e) => {
                    const items = [...sutras];
                    items[index] = { ...items[index], sanskrit: e.target.value };
                    patch({ sutras: items });
                  }}
                  className={inputClass}
                />
                <input
                  placeholder="Transliteration"
                  value={sutra.transliteration ?? ""}
                  onChange={(e) => {
                    const items = [...sutras];
                    items[index] = { ...items[index], transliteration: e.target.value };
                    patch({ sutras: items });
                  }}
                  className={inputClass}
                />
                <textarea
                  placeholder="Translation"
                  rows={2}
                  value={sutra.translation ?? ""}
                  onChange={(e) => {
                    const items = [...sutras];
                    items[index] = { ...items[index], translation: e.target.value };
                    patch({ sutras: items });
                  }}
                  className={inputClass}
                />
                <input
                  placeholder="Source (e.g. Patanjali Yoga Sutra 1.2)"
                  value={sutra.source ?? ""}
                  onChange={(e) => {
                    const items = [...sutras];
                    items[index] = { ...items[index], source: e.target.value };
                    patch({ sutras: items });
                  }}
                  className={inputClass}
                />
                <textarea
                  placeholder="Interpretation"
                  rows={3}
                  value={sutra.interpretation ?? ""}
                  onChange={(e) => {
                    const items = [...sutras];
                    items[index] = { ...items[index], interpretation: e.target.value };
                    patch({ sutras: items });
                  }}
                  className={inputClass}
                />
                <button
                  type="button"
                  className="text-xs text-red-600"
                  onClick={() => patch({ sutras: sutras.filter((_, i) => i !== index) })}
                >
                  Remove sutra
                </button>
              </div>
            ))}
            <button
              type="button"
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
              onClick={() =>
                patch({
                  sutras: [
                    ...sutras,
                    {
                      sanskrit: "",
                      transliteration: "",
                      translation: "",
                      source: "",
                      interpretation: "",
                    },
                  ],
                })
              }
            >
              + Add sutra passage
            </button>
          </div>
        </div>
      ) : null}

      {isTimelineCustomTextVariant(variant) ? (
        <TimelineStyleEditor
          style={data.timelineStyle}
          scope={(data.timelineStyleScope as TimelineStyleScope | undefined) ?? "section"}
          onStyleChange={(timelineStyle) => patch({ timelineStyle })}
          onScopeChange={(timelineStyleScope) => patch({ timelineStyleScope })}
        />
      ) : null}

      {variant === "healing-journey" || variant === "art-journey" ? (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
            <input
              type="checkbox"
              checked={data.highlightsEnabled !== false}
              onChange={(e) => patch({ highlightsEnabled: e.target.checked })}
            />
            Show callout boxes
          </label>
          {data.highlightsEnabled !== false ? (
            <div className="space-y-3">
              {highlights.map((item, index) => (
                <div key={index} className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-600">
                    <input
                      type="checkbox"
                      checked={item.enabled !== false}
                      onChange={(e) => {
                        const items = [...highlights];
                        items[index] = { ...items[index], enabled: e.target.checked };
                        patch({ highlights: items });
                      }}
                    />
                    Enabled
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="Insert after paragraph index (0-based)"
                    value={item.afterIndex}
                    onChange={(e) => {
                      const items = [...highlights];
                      items[index] = { ...items[index], afterIndex: Number(e.target.value) || 0 };
                      patch({ highlights: items });
                    }}
                    className={inputClass}
                  />
                  <input
                    placeholder="Callout title / eyebrow"
                    value={item.label ?? ""}
                    onChange={(e) => {
                      const items = [...highlights];
                      items[index] = { ...items[index], label: e.target.value };
                      patch({ highlights: items });
                    }}
                    className={inputClass}
                  />
                  <textarea
                    placeholder="Callout content"
                    rows={3}
                    value={item.text}
                    onChange={(e) => {
                      const items = [...highlights];
                      items[index] = { ...items[index], text: e.target.value };
                      patch({ highlights: items });
                    }}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    className="text-xs text-red-600"
                    onClick={() => patch({ highlights: highlights.filter((_, i) => i !== index) })}
                  >
                    Remove callout
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                onClick={() =>
                  patch({
                    highlights: [...highlights, { afterIndex: introCount, label: "", text: "", enabled: true }],
                  })
                }
              >
                + Add callout box
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
