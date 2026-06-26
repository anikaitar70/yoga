"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  PREVIEW_DESKTOP_ASPECT_RATIO,
  PREVIEW_VIEWPORT_LABELS,
  PREVIEW_VIEWPORT_WIDTHS,
  PREVIEW_ZOOM_LABELS,
  PREVIEW_ZOOM_LEVELS,
  type PreviewViewportMode,
  type PreviewZoomLevel,
} from "@/lib/preview-viewport";
import { cn } from "@/lib/utils";

type PreviewViewportProps = {
  mode: PreviewViewportMode;
  onModeChange: (mode: PreviewViewportMode) => void;
  children: ReactNode;
  className?: string;
  minHeight?: string;
  /** @deprecated Use minHeight */
  maxHeight?: string;
  compact?: boolean;
  showToggle?: boolean;
  desktopVirtualWidth?: number;
  aspectRatio?: number;
  zoom?: PreviewZoomLevel;
  onZoomChange?: (zoom: PreviewZoomLevel) => void;
  showZoomControls?: boolean;
};

export function PreviewViewportToggle({
  mode,
  onModeChange,
  compact = false,
}: Pick<PreviewViewportProps, "mode" | "onModeChange" | "compact">) {
  return (
    <div
      className={cn(
        "inline-flex rounded-full border p-1",
        compact ? "border-amber-300 bg-white" : "border-slate-300 bg-slate-50",
      )}
      role="group"
      aria-label="Preview device width"
    >
      {(Object.keys(PREVIEW_VIEWPORT_WIDTHS) as PreviewViewportMode[]).map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onModeChange(key)}
          className={cn(
            "rounded-full font-semibold transition-colors",
            compact ? "px-3 py-1.5 text-xs" : "px-3.5 py-1.5 text-xs",
            mode === key
              ? "bg-slate-900 text-white"
              : compact
                ? "text-amber-950 hover:bg-amber-100"
                : "text-slate-700 hover:bg-white",
          )}
        >
          {PREVIEW_VIEWPORT_LABELS[key]}
        </button>
      ))}
    </div>
  );
}

export function PreviewZoomToggle({
  zoom,
  onZoomChange,
  compact = false,
}: {
  zoom: PreviewZoomLevel;
  onZoomChange: (zoom: PreviewZoomLevel) => void;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "inline-flex rounded-full border p-1",
        compact ? "border-amber-300 bg-white" : "border-slate-300 bg-slate-50",
      )}
      role="group"
      aria-label="Preview zoom"
    >
      {PREVIEW_ZOOM_LEVELS.map((level) => (
        <button
          key={String(level)}
          type="button"
          onClick={() => onZoomChange(level)}
          className={cn(
            "rounded-full font-semibold transition-colors",
            compact ? "px-3 py-1.5 text-xs" : "px-3.5 py-1.5 text-xs",
            zoom === level
              ? "bg-slate-900 text-white"
              : compact
                ? "text-amber-950 hover:bg-amber-100"
                : "text-slate-700 hover:bg-white",
          )}
        >
          {PREVIEW_ZOOM_LABELS[level]}
        </button>
      ))}
    </div>
  );
}

export function PreviewViewport({
  mode,
  onModeChange,
  children,
  className,
  minHeight = "700px",
  maxHeight,
  compact = false,
  showToggle = true,
  desktopVirtualWidth = 1280,
  aspectRatio = PREVIEW_DESKTOP_ASPECT_RATIO,
  zoom = 1,
  onZoomChange,
  showZoomControls = false,
}: PreviewViewportProps) {
  const resolvedMinHeight = maxHeight ?? minHeight;
  const widthPx = PREVIEW_VIEWPORT_WIDTHS[mode];
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [hostWidth, setHostWidth] = useState(0);

  useEffect(() => {
    const node = hostRef.current;
    if (!node) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      const rounded = Math.round(width);
      setHostWidth((prev) => (Math.abs(prev - rounded) < 2 ? prev : rounded));
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const minHeightPx = Number.parseInt(resolvedMinHeight.replace(/[^\d]/g, ""), 10) || 700;
  const contentWidth =
    mode === "desktop"
      ? zoom === "fit"
        ? Math.max(hostWidth > 0 ? hostWidth - 16 : desktopVirtualWidth, 280)
        : Math.min(hostWidth > 0 ? Math.max(hostWidth - 16, 280) : desktopVirtualWidth, desktopVirtualWidth)
      : widthPx ?? desktopVirtualWidth;

  const frameStyle: CSSProperties =
    mode === "desktop"
      ? {
          width: zoom === "fit" ? "100%" : `${contentWidth}px`,
          maxWidth: "100%",
          minHeight: resolvedMinHeight,
        }
      : {
          width: widthPx ? `${widthPx}px` : "100%",
          maxWidth: "100%",
          minHeight: resolvedMinHeight,
        };

  const numericZoom = zoom === "fit" ? 1 : zoom;
  const fitScale =
    zoom === "fit" && hostWidth > 0 && contentWidth > 0
      ? Math.min(1, (hostWidth - 16) / contentWidth)
      : 1;
  const appliedScale = zoom === "fit" ? fitScale : numericZoom;
  const scaledLayoutWidth = contentWidth * appliedScale;
  const scaledLayoutHeight = minHeightPx * appliedScale;

  const canvas = (
    <div
      className={cn(
        "preview-viewport-canvas relative origin-top overflow-x-hidden overflow-y-auto bg-background shadow-sm",
        mode !== "desktop" && "border-x border-dashed border-slate-300",
        className,
      )}
      style={{
        ...frameStyle,
        ...(appliedScale !== 1
          ? {
              width: `${contentWidth}px`,
              maxWidth: "none",
              transform: `scale(${appliedScale})`,
              transformOrigin: "top center",
            }
          : {}),
      }}
    >
      {children}
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {showToggle ? (
          <PreviewViewportToggle mode={mode} onModeChange={onModeChange} compact={compact} />
        ) : (
          <div />
        )}
        {showZoomControls && onZoomChange ? (
          <PreviewZoomToggle zoom={zoom} onZoomChange={onZoomChange} compact={compact} />
        ) : null}
      </div>
      <div
        ref={hostRef}
        className={cn(
          "flex justify-center overflow-x-hidden overflow-y-auto rounded-xl border border-slate-200 bg-slate-100/80 p-2 sm:p-3",
        )}
        data-preview-mode={mode}
        style={{ minHeight: resolvedMinHeight }}
      >
        {appliedScale !== 1 ? (
          <div
            className="mx-auto"
            style={{ width: `${scaledLayoutWidth}px`, minHeight: `${scaledLayoutHeight}px` }}
          >
            {canvas}
          </div>
        ) : (
          canvas
        )}
      </div>
      {mode === "desktop" ? (
        <p className="text-center text-[11px] text-slate-500">
          Preview · {Math.round(contentWidth)}×{minHeightPx}px min
          {appliedScale !== 1 ? ` · ${Math.round(appliedScale * 100)}% zoom` : ""}
        </p>
      ) : null}
    </div>
  );
}
