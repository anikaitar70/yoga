"use client";

import {
  FONT_SIZE_PX_MAX,
  FONT_SIZE_PX_MIN,
  fontSizePxToNumber,
  parseFontSizePx,
} from "@/lib/design-settings";

type FontSizeControlProps = {
  label?: string;
  value: string | undefined;
  fallback: string;
  onChange: (value: string) => void;
  className?: string;
};

export function FontSizeControl({
  label = "Font size",
  value,
  fallback,
  onChange,
  className,
}: FontSizeControlProps) {
  const resolved = parseFontSizePx(value, fallback);
  const numeric = fontSizePxToNumber(resolved);

  function setNumeric(next: number) {
    const clamped = Math.min(FONT_SIZE_PX_MAX, Math.max(FONT_SIZE_PX_MIN, next));
    onChange(`${clamped}px`);
  }

  return (
    <div className={className}>
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      <div className="mt-2 flex items-center gap-3">
        <input
          type="range"
          min={FONT_SIZE_PX_MIN}
          max={FONT_SIZE_PX_MAX}
          step={1}
          value={numeric}
          onChange={(e) => setNumeric(Number(e.target.value))}
          className="min-w-0 flex-1"
        />
        <div className="flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1.5">
          <input
            type="number"
            min={FONT_SIZE_PX_MIN}
            max={FONT_SIZE_PX_MAX}
            value={numeric}
            onChange={(e) => setNumeric(Number(e.target.value))}
            className="w-12 border-0 bg-transparent text-center text-sm font-medium text-slate-900 outline-none"
            aria-label={`${label} in pixels`}
          />
          <span className="text-xs text-slate-500">px</span>
        </div>
      </div>
    </div>
  );
}
