"use client";

import type { SectionTextAlignment } from "@/lib/section-layout";
import { cn } from "@/lib/utils";

type PreviewAlignmentRailProps = {
  visible: boolean;
  alignment: SectionTextAlignment;
  sectionTitle?: string | null;
  onChange: (alignment: SectionTextAlignment) => void;
};

const OPTIONS: { value: SectionTextAlignment; label: string; short: string }[] = [
  { value: "left", label: "Align left", short: "Left" },
  { value: "center", label: "Align center", short: "Center" },
];

export function PreviewAlignmentRail({
  visible,
  alignment,
  sectionTitle,
  onChange,
}: PreviewAlignmentRailProps) {
  if (!visible) {
    return null;
  }

  return (
    <aside
      className="flex shrink-0 flex-col items-center border-l border-slate-200 bg-white py-4"
      aria-label="Text alignment"
    >
      <p className="mb-3 max-w-[4.5rem] text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500 [writing-mode:vertical-rl] rotate-180">
        Text align
      </p>
      <div className="flex flex-col gap-2 px-2">
        {OPTIONS.map((option) => {
          const active = alignment === option.value;
          return (
            <button
              key={option.value}
              type="button"
              title={`${option.label}${sectionTitle ? ` — ${sectionTitle}` : ""}`}
              aria-label={option.label}
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl border text-[10px] font-bold uppercase tracking-wide transition-colors",
                active
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-slate-50 text-slate-700 hover:bg-white",
              )}
            >
              {option.short}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
