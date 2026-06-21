"use client";

import {
  SITE_BACKGROUND_VARIANTS,
  type SiteBackgroundVariant,
} from "@/lib/site-background";
import { cn } from "@/lib/utils";

type SiteBackgroundPickerProps = {
  value: SiteBackgroundVariant;
  onChange: (value: SiteBackgroundVariant) => void;
};

const VARIANT_ORDER: SiteBackgroundVariant[] = ["aurora", "mandala", "horizon", "ripple"];

function PreviewSwatch({ variant }: { variant: SiteBackgroundVariant }) {
  if (variant === "mandala") {
    return (
      <div className="relative h-full w-full overflow-hidden bg-[#f5f0e8]">
        <svg viewBox="0 0 100 100" className="absolute -right-3 top-2 h-16 w-16 text-[#5c6b52]/25" fill="none">
          <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="0.8" />
          <circle cx="50" cy="50" r="24" stroke="currentColor" strokeWidth="0.8" />
          <path d="M10 50h80M50 10v80" stroke="currentColor" strokeWidth="0.6" />
        </svg>
      </div>
    );
  }

  if (variant === "horizon") {
    return (
      <div className="relative h-full w-full overflow-hidden bg-[#f5f0e8]">
        <div className="absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-[#f0ddd3]/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#ebe4d8]/80 to-transparent" />
      </div>
    );
  }

  if (variant === "ripple") {
    return (
      <div className="relative h-full w-full overflow-hidden bg-[#f5f0e8]">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(92,107,82,0.25) 1px, transparent 0)",
            backgroundSize: "8px 8px",
          }}
        />
        <svg viewBox="0 0 120 40" className="absolute inset-x-0 top-4 h-8 w-full text-[#5c6b52]/20" fill="none">
          <path d="M0 20 C30 8 60 32 90 20 S110 8 120 20" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#f5f0e8]">
      <div className="absolute -left-2 top-2 h-10 w-10 rounded-full bg-[#c47a5a]/25 blur-md" />
      <div className="absolute right-0 top-4 h-9 w-9 rounded-full bg-[#5c6b52]/20 blur-md" />
      <div className="absolute bottom-1 left-1/3 h-8 w-8 rounded-full bg-[#8b7355]/20 blur-md" />
    </div>
  );
}

export function SiteBackgroundPicker({ value, onChange }: SiteBackgroundPickerProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold text-slate-900">Page background</h3>
      <p className="mt-1 text-xs text-slate-500">
        Animated scroll backdrop used across the public site. Pick a preset below, then save site config.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {VARIANT_ORDER.map((variant) => {
          const meta = SITE_BACKGROUND_VARIANTS[variant];
          const selected = value === variant;

          return (
            <button
              key={variant}
              type="button"
              onClick={() => onChange(variant)}
              className={cn(
                "overflow-hidden rounded-xl border bg-white text-left transition",
                selected
                  ? "border-slate-900 ring-2 ring-slate-900/10"
                  : "border-slate-200 hover:border-slate-400",
              )}
            >
              <div className="h-20 border-b border-slate-100">
                <PreviewSwatch variant={variant} />
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-slate-900">{meta.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{meta.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
