"use client";

import {
  DEFAULT_TIMELINE_STYLE,
  TIMELINE_FONT_OPTIONS,
  TIMELINE_SIZE_OPTIONS,
  TIMELINE_STYLE_SCOPE_LABELS,
  TIMELINE_STYLE_SCOPES,
  TIMELINE_WEIGHT_OPTIONS,
  mergeTimelineStyle,
  timelineStyleToCssVariables,
  type TimelineStyleScope,
  type TimelineStyleSettings,
} from "@/lib/timeline-style";
import type { CustomTextSectionPayload } from "@/lib/page-section-types";

const inputClass =
  "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

const labelClass = "block text-xs font-medium text-slate-600";

type TimelineStyleEditorProps = {
  style: TimelineStyleSettings | undefined;
  scope: TimelineStyleScope | undefined;
  onStyleChange: (style: TimelineStyleSettings) => void;
  onScopeChange: (scope: TimelineStyleScope) => void;
  showScope?: boolean;
  compact?: boolean;
};

function ColorField({
  label,
  value,
  defaultValue,
  onChange,
}: {
  label: string;
  value: string | undefined;
  defaultValue: string;
  onChange: (value: string) => void;
}) {
  const resolved = value || defaultValue;
  const isCssVar = resolved.startsWith("var(");

  return (
    <label className={labelClass}>
      {label}
      <div className="mt-1 flex items-center gap-2">
        <input
          type="color"
          value={isCssVar ? "#c47a5a" : resolved}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded-lg border border-slate-300 bg-white p-0.5"
          aria-label={`${label} color picker`}
        />
        <select
          value={isCssVar ? resolved : "custom"}
          onChange={(e) => {
            if (e.target.value !== "custom") onChange(e.target.value);
          }}
          className={inputClass}
        >
          <option value="var(--primary)">Brand primary</option>
          <option value="var(--primary-muted)">Primary muted</option>
          <option value="var(--foreground)">Foreground</option>
          <option value="var(--muted)">Muted text</option>
          <option value="var(--accent)">Sage accent</option>
          <option value="custom">Custom (use picker)</option>
        </select>
      </div>
    </label>
  );
}

function StyleSelect({
  label,
  value,
  defaultValue,
  options,
  onChange,
}: {
  label: string;
  value: string | undefined;
  defaultValue: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className={labelClass}>
      {label}
      <select value={value ?? defaultValue} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function TimelineStyleEditor({
  style,
  scope = "section",
  onStyleChange,
  onScopeChange,
  showScope = true,
  compact = false,
}: TimelineStyleEditorProps) {
  const current = { ...DEFAULT_TIMELINE_STYLE, ...style };

  function patchStyle(partial: Partial<TimelineStyleSettings>) {
    onStyleChange({ ...style, ...partial });
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
      <div>
        <p className="text-sm font-semibold text-slate-800">Timeline styling</p>
        <p className="mt-1 text-xs text-slate-500">
          Colors and typography for timeline numbers, titles, and body text. Unset fields use Nirvana Yoga
          defaults with improved contrast.
        </p>
      </div>

      {showScope ? (
        <label className={labelClass}>
          Apply style changes to
          <select
            value={scope}
            onChange={(e) => onScopeChange(e.target.value as TimelineStyleScope)}
            className={inputClass}
          >
            {TIMELINE_STYLE_SCOPES.map((option) => (
              <option key={option} value={option}>
                {TIMELINE_STYLE_SCOPE_LABELS[option]}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <div className={compact ? "grid gap-3 sm:grid-cols-2" : "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"}>
        <ColorField
          label="Number / year color"
          value={style?.numberColor}
          defaultValue={DEFAULT_TIMELINE_STYLE.numberColor}
          onChange={(numberColor) => patchStyle({ numberColor })}
        />
        <ColorField
          label="Title color"
          value={style?.titleColor}
          defaultValue={DEFAULT_TIMELINE_STYLE.titleColor}
          onChange={(titleColor) => patchStyle({ titleColor })}
        />
        <ColorField
          label="Body text color"
          value={style?.textColor}
          defaultValue={DEFAULT_TIMELINE_STYLE.textColor}
          onChange={(textColor) => patchStyle({ textColor })}
        />
        <ColorField
          label="Line color"
          value={style?.lineColor}
          defaultValue={DEFAULT_TIMELINE_STYLE.lineColor}
          onChange={(lineColor) => patchStyle({ lineColor })}
        />
        <ColorField
          label="Dot color"
          value={style?.dotColor}
          defaultValue={DEFAULT_TIMELINE_STYLE.dotColor}
          onChange={(dotColor) => patchStyle({ dotColor })}
        />
      </div>

      <div className={compact ? "grid gap-3 sm:grid-cols-2" : "grid gap-3 sm:grid-cols-3"}>
        <StyleSelect
          label="Number font"
          value={style?.numberFont}
          defaultValue={DEFAULT_TIMELINE_STYLE.numberFont}
          options={TIMELINE_FONT_OPTIONS}
          onChange={(numberFont) => patchStyle({ numberFont })}
        />
        <StyleSelect
          label="Title font"
          value={style?.titleFont}
          defaultValue={DEFAULT_TIMELINE_STYLE.titleFont}
          options={TIMELINE_FONT_OPTIONS}
          onChange={(titleFont) => patchStyle({ titleFont })}
        />
        <StyleSelect
          label="Body font"
          value={style?.textFont}
          defaultValue={DEFAULT_TIMELINE_STYLE.textFont}
          options={TIMELINE_FONT_OPTIONS}
          onChange={(textFont) => patchStyle({ textFont })}
        />
        <StyleSelect
          label="Number weight"
          value={style?.numberWeight}
          defaultValue={DEFAULT_TIMELINE_STYLE.numberWeight}
          options={TIMELINE_WEIGHT_OPTIONS}
          onChange={(numberWeight) => patchStyle({ numberWeight })}
        />
        <StyleSelect
          label="Title weight"
          value={style?.titleWeight}
          defaultValue={DEFAULT_TIMELINE_STYLE.titleWeight}
          options={TIMELINE_WEIGHT_OPTIONS}
          onChange={(titleWeight) => patchStyle({ titleWeight })}
        />
        <StyleSelect
          label="Body weight"
          value={style?.textWeight}
          defaultValue={DEFAULT_TIMELINE_STYLE.textWeight}
          options={TIMELINE_WEIGHT_OPTIONS}
          onChange={(textWeight) => patchStyle({ textWeight })}
        />
        <StyleSelect
          label="Number size"
          value={style?.numberSize}
          defaultValue={DEFAULT_TIMELINE_STYLE.numberSize}
          options={TIMELINE_SIZE_OPTIONS}
          onChange={(numberSize) => patchStyle({ numberSize })}
        />
        <StyleSelect
          label="Title size"
          value={style?.titleSize}
          defaultValue={DEFAULT_TIMELINE_STYLE.titleSize}
          options={TIMELINE_SIZE_OPTIONS}
          onChange={(titleSize) => patchStyle({ titleSize })}
        />
        <StyleSelect
          label="Body size"
          value={style?.textSize}
          defaultValue={DEFAULT_TIMELINE_STYLE.textSize}
          options={TIMELINE_SIZE_OPTIONS}
          onChange={(textSize) => patchStyle({ textSize })}
        />
      </div>

      <div
        className="timeline-styled rounded-xl border border-slate-200 bg-white p-4"
        style={timelineStyleToCssVariables(current)}
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Live preview</p>
        <div className="grid gap-4 sm:grid-cols-12 sm:items-start">
          <span
            className="sm:col-span-2 font-display"
            style={{ color: "var(--timeline-number-color)", fontSize: "var(--timeline-number-size, 1.875rem)" }}
          >
            01
          </span>
          <p className="sm:col-span-10 text-sm" style={{ color: "var(--timeline-text-color)" }}>
            Sample timeline body text with your selected colors.
          </p>
        </div>
      </div>
    </div>
  );
}

export function isTimelineCustomTextVariant(
  variant: CustomTextSectionPayload["variant"] | undefined,
): boolean {
  return variant === "art-journey" || variant === "experience-timeline";
}
