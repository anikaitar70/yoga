"use client";

import type { PageSectionType } from "@/lib/page-section-types";
import { PAGE_SECTION_TYPE_LABELS } from "@/lib/page-section-types";
import { previewControlsForSection } from "@/lib/preview-layout-controls";
import {
  cardWidthFromVisibleCount,
  clampLayoutSettings,
  LAYOUT_TUNING_RANGES,
  mergeLayoutSettings,
  SECTION_ANIMATION_LABELS,
  SECTION_ANIMATION_OPTIONS,
  SECTION_GALLERY_STYLE_LABELS,
  SECTION_GALLERY_STYLE_OPTIONS,
  SECTION_IMAGE_SIDE_LABELS,
  SECTION_IMAGE_SIDE_OPTIONS,
  SECTION_STYLE_LABELS,
  SECTION_STYLE_OPTIONS,
  type SectionLayoutSettings,
} from "@/lib/section-layout";
import { cn } from "@/lib/utils";

type PreviewLayoutPanelProps = {
  sectionId: string | null;
  sectionType: PageSectionType | null;
  sectionTitle: string | null;
  baseLayout: SectionLayoutSettings | null;
  layout: SectionLayoutSettings;
  busy: boolean;
  onChange: (layout: SectionLayoutSettings) => void;
  onSave: () => void;
  onReset: () => void;
};

function SliderControl({
  label,
  value,
  range,
  onChange,
}: {
  label: string;
  value: number | undefined;
  range: (typeof LAYOUT_TUNING_RANGES)[keyof typeof LAYOUT_TUNING_RANGES];
  onChange: (value: number) => void;
}) {
  const current = value ?? range.default;

  return (
    <label className="block space-y-2 text-sm text-slate-700">
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-xs text-slate-500">{current}</span>
      </div>
      <input
        type="range"
        min={range.min}
        max={range.max}
        step={range.step}
        value={current}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-slate-900"
      />
    </label>
  );
}

export function PreviewLayoutPanel({
  sectionId,
  sectionType,
  sectionTitle,
  baseLayout,
  layout,
  busy,
  onChange,
  onSave,
  onReset,
}: PreviewLayoutPanelProps) {
  if (!sectionId || !sectionType) {
    return (
      <aside className="w-full shrink-0 border-t border-slate-200 bg-white p-4 lg:w-80 lg:border-l lg:border-t-0">
        <p className="text-sm text-slate-600">Select a section in the preview to tune spacing and sizing.</p>
      </aside>
    );
  }

  const merged = mergeLayoutSettings({ ...baseLayout, ...layout }, sectionType);
  const controls = previewControlsForSection(sectionType);

  function update(patch: Partial<SectionLayoutSettings>) {
    onChange(clampLayoutSettings({ ...layout, ...patch }));
  }

  return (
    <aside className="w-full shrink-0 border-t border-slate-200 bg-white p-4 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:w-80 lg:overflow-y-auto lg:border-l lg:border-t-0">
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Layout tuning</p>
          <h2 className="mt-1 text-base font-semibold text-slate-900">
            {sectionTitle || "Untitled section"}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {PAGE_SECTION_TYPE_LABELS[sectionType]} · live preview only until saved
          </p>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
          {controls.has("spacing") ? (
            <>
              <SliderControl
                label="Section top padding"
                value={merged.paddingTop}
                range={LAYOUT_TUNING_RANGES.paddingTop}
                onChange={(paddingTop) => update({ paddingTop })}
              />
              <SliderControl
                label="Section bottom padding"
                value={merged.paddingBottom}
                range={LAYOUT_TUNING_RANGES.paddingBottom}
                onChange={(paddingBottom) => update({ paddingBottom })}
              />
              <SliderControl
                label="Spacing below section"
                value={merged.sectionGap}
                range={LAYOUT_TUNING_RANGES.sectionGap}
                onChange={(sectionGap) => update({ sectionGap })}
              />
            </>
          ) : null}

          {controls.has("contentWidth") ? (
            <SliderControl
              label="Content width"
              value={merged.contentWidthPx}
              range={LAYOUT_TUNING_RANGES.contentWidthPx}
              onChange={(contentWidthPx) => update({ contentWidthPx })}
            />
          ) : null}

          {controls.has("textWidth") ? (
            <SliderControl
              label="Text max width"
              value={merged.textMaxWidthPx}
              range={LAYOUT_TUNING_RANGES.textMaxWidthPx}
              onChange={(textMaxWidthPx) => update({ textMaxWidthPx })}
            />
          ) : null}

          {controls.has("image") ? (
            <>
              <SliderControl
                label="Image height"
                value={merged.imageHeight}
                range={LAYOUT_TUNING_RANGES.imageHeight}
                onChange={(imageHeight) => update({ imageHeight })}
              />
              <SliderControl
                label="Image aspect ratio"
                value={merged.imageAspectRatio}
                range={LAYOUT_TUNING_RANGES.imageAspectRatio}
                onChange={(imageAspectRatio) => update({ imageAspectRatio })}
              />
              {sectionType === "IMAGE_TEXT" ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Image side</p>
                  <div
                    className="inline-flex rounded-full border border-slate-300 bg-slate-50 p-1"
                    role="group"
                    aria-label="Image side"
                  >
                    {SECTION_IMAGE_SIDE_OPTIONS.map((option) => {
                      const active = (layout.imageSide ?? merged.imageSide ?? "left") === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => update({ imageSide: option })}
                          className={cn(
                            "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                            active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-white",
                          )}
                        >
                          {SECTION_IMAGE_SIDE_LABELS[option]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </>
          ) : null}

          {controls.has("cards") ? (
            <>
              <SliderControl
                label={sectionType === "TESTIMONIALS" ? "Testimonial card width" : "Card width"}
                value={merged.cardWidth}
                range={LAYOUT_TUNING_RANGES.cardWidth}
                onChange={(cardWidth) => update({ cardWidth })}
              />
              <SliderControl
                label="Cards visible on desktop"
                value={merged.desktopCardsVisible}
                range={LAYOUT_TUNING_RANGES.desktopCardsVisible}
                onChange={(desktopCardsVisible) =>
                  update({
                    desktopCardsVisible,
                    cardWidth: cardWidthFromVisibleCount(desktopCardsVisible, merged.contentWidthPx ?? 1120),
                  })
                }
              />
            </>
          ) : null}

          {controls.has("gallery") ? (
            <>
              <SliderControl
                label="Gallery image height"
                value={merged.galleryHeight}
                range={LAYOUT_TUNING_RANGES.galleryHeight}
                onChange={(galleryHeight) => update({ galleryHeight })}
              />
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Gallery style</p>
                <div className="flex flex-wrap gap-2">
                  {SECTION_GALLERY_STYLE_OPTIONS.map((option) => {
                    const active = (layout.galleryStyle ?? merged.galleryStyle ?? "horizontal") === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => update({ galleryStyle: option })}
                        className={cn(
                          "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                          active ? "bg-slate-900 text-white" : "border border-slate-300 text-slate-700 hover:bg-slate-50",
                        )}
                      >
                        {SECTION_GALLERY_STYLE_LABELS[option]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : null}

          {controls.has("style") ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Section style</p>
              <div className="flex flex-wrap gap-2">
                {SECTION_STYLE_OPTIONS.map((option) => {
                  const active = (layout.sectionStyle ?? merged.sectionStyle ?? "default") === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => update({ sectionStyle: option })}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                        active ? "bg-slate-900 text-white" : "border border-slate-300 text-slate-700 hover:bg-slate-50",
                      )}
                    >
                      {SECTION_STYLE_LABELS[option]}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {controls.has("animation") ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Animation preset</p>
              <div className="flex flex-wrap gap-2">
                {SECTION_ANIMATION_OPTIONS.map((option) => {
                  const active = (layout.animationPreset ?? merged.animationPreset ?? "rise") === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => update({ animationPreset: option })}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                        active ? "bg-slate-900 text-white" : "border border-slate-300 text-slate-700 hover:bg-slate-50",
                      )}
                    >
                      {SECTION_ANIMATION_LABELS[option]}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onSave}
            className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save layout"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onReset}
            className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
          >
            Reset section
          </button>
        </div>
      </div>
    </aside>
  );
}
