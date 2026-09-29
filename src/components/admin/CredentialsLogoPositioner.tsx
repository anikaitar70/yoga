"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  DEFAULT_CREDENTIALS_LOGO_PLACEMENT,
  type CredentialsLogoPlacement,
} from "@/lib/site-branding";

type Variant = "desktop" | "mobile";

/** Mock canvas px size + the real footer content width it stands in for (for size scaling). */
const CANVAS: Record<Variant, { width: number; height: number; realWidth: number }> = {
  desktop: { width: 640, height: 220, realWidth: 1152 },
  mobile: { width: 260, height: 480, realWidth: 360 },
};

const WIDTH_MIN = 40;
const WIDTH_MAX = 320;

function getClientPoint(event: MouseEvent | TouchEvent | PointerEvent): { x: number; y: number } {
  if ("clientX" in event) return { x: event.clientX, y: event.clientY };
  const touch = event.changedTouches?.[0] ?? event.touches?.[0];
  return { x: touch?.clientX ?? 0, y: touch?.clientY ?? 0 };
}

function DesktopMock() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 grid grid-cols-4 gap-4 p-5 text-[9px] leading-tight text-slate-400">
      <div className="space-y-2">
        <div className="h-4 w-16 rounded bg-slate-300/80" />
        <div className="h-1.5 w-20 rounded bg-slate-300/60" />
        <div className="h-1.5 w-16 rounded bg-slate-300/60" />
      </div>
      <div className="space-y-1.5">
        <p className="uppercase tracking-wide text-slate-400">Explore</p>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-1.5 w-14 rounded bg-slate-300/60" />
        ))}
      </div>
      <div className="space-y-1.5">
        <p className="uppercase tracking-wide text-slate-400">Newsletter</p>
        <div className="h-1.5 w-16 rounded bg-slate-300/60" />
        <div className="h-4 w-20 rounded-full bg-slate-300/70" />
      </div>
      <div className="space-y-1.5">
        <p className="uppercase tracking-wide text-slate-400">Contact</p>
        <div className="h-1.5 w-16 rounded bg-slate-300/60" />
        <div className="h-1.5 w-12 rounded bg-slate-300/60" />
      </div>
    </div>
  );
}

function MobileMock() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col gap-4 p-4 text-[9px] leading-tight text-slate-400">
      <div className="space-y-2">
        <div className="h-4 w-16 rounded bg-slate-300/80" />
        <div className="h-1.5 w-28 rounded bg-slate-300/60" />
        <div className="h-1.5 w-24 rounded bg-slate-300/60" />
      </div>
      <div className="space-y-1.5">
        <p className="uppercase tracking-wide text-slate-400">Explore</p>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-1.5 w-20 rounded bg-slate-300/60" />
        ))}
      </div>
      <div className="space-y-1.5">
        <p className="uppercase tracking-wide text-slate-400">Newsletter</p>
        <div className="h-4 w-24 rounded-full bg-slate-300/70" />
      </div>
      <div className="space-y-1.5">
        <p className="uppercase tracking-wide text-slate-400">Contact</p>
        <div className="h-1.5 w-20 rounded bg-slate-300/60" />
      </div>
    </div>
  );
}

type CredentialsLogoPositionerProps = {
  logoSrc: string;
  alt: string;
  desktop?: CredentialsLogoPlacement;
  mobile?: CredentialsLogoPlacement;
  onChange: (variant: Variant, placement: CredentialsLogoPlacement) => void;
};

export function CredentialsLogoPositioner({
  logoSrc,
  alt,
  desktop,
  mobile,
  onChange,
}: CredentialsLogoPositionerProps) {
  const [variant, setVariant] = useState<Variant>("desktop");
  const canvasRef = useRef<HTMLDivElement>(null);

  const placement = (variant === "desktop" ? desktop : mobile) ?? DEFAULT_CREDENTIALS_LOGO_PLACEMENT[variant];
  const canvas = CANVAS[variant];
  const previewWidthPx = Math.round(placement.widthPx * (canvas.width / canvas.realWidth));

  function handleDragEnd(event: MouseEvent | TouchEvent | PointerEvent) {
    const box = canvasRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const { x, y } = getClientPoint(event);
    const xPercent = Math.min(100, Math.max(0, ((x - rect.left) / rect.width) * 100));
    const yPercent = Math.min(100, Math.max(0, ((y - rect.top) / rect.height) * 100));
    onChange(variant, { ...placement, xPercent, yPercent });
  }

  return (
    <div className="space-y-3">
      <div className="inline-flex rounded-full border border-slate-300 bg-slate-50 p-1" role="tablist" aria-label="Footer layout preview">
        {(["desktop", "mobile"] as const).map((v) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={variant === v}
            onClick={() => setVariant(v)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
              variant === v ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-white",
            )}
          >
            {v === "desktop" ? "Desktop layout" : "Mobile layout"}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-500">
        Drag the badge anywhere in the mock-up to set where it sits{" "}
        {variant === "desktop" ? "on tablet/desktop (≥768px, multi-column footer)" : "on phones (<768px, stacked footer)"}. It
        renders behind the footer text - text always stays readable on top.
      </p>

      <div
        ref={canvasRef}
        className="relative overflow-hidden rounded-xl border border-dashed border-slate-300 bg-[#f7f2ea]"
        style={{ width: canvas.width, height: canvas.height, touchAction: "none" }}
      >
        {variant === "desktop" ? <DesktopMock /> : <MobileMock />}

        <motion.img
          key={`${variant}-${placement.xPercent}-${placement.yPercent}-${placement.widthPx}`}
          src={logoSrc}
          alt={alt || "Credentials logo"}
          drag
          dragConstraints={canvasRef}
          dragElastic={0}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          className="absolute z-0 h-auto cursor-grab touch-none object-contain opacity-90 ring-2 ring-slate-900/40 active:cursor-grabbing"
          style={{
            left: `${(placement.xPercent / 100) * canvas.width}px`,
            top: `${(placement.yPercent / 100) * canvas.height}px`,
            width: `${previewWidthPx}px`,
            translate: "-50% -50%",
          }}
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="flex-1 text-sm font-medium text-slate-700">
          Size — {placement.widthPx}px wide
          <input
            type="range"
            min={WIDTH_MIN}
            max={WIDTH_MAX}
            step={4}
            value={placement.widthPx}
            onChange={(event) => onChange(variant, { ...placement, widthPx: Number(event.target.value) })}
            className="mt-2 w-full accent-slate-900"
          />
        </label>
        <button
          type="button"
          onClick={() => onChange(variant, DEFAULT_CREDENTIALS_LOGO_PLACEMENT[variant])}
          className="text-xs font-medium text-slate-600 underline"
        >
          Reset {variant} position
        </button>
      </div>
    </div>
  );
}
