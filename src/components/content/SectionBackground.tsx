import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { SectionBackgroundSettings } from "@/lib/section-layout";

type SectionBackgroundProps = {
  settings?: SectionBackgroundSettings | null;
  children: ReactNode;
  className?: string;
};

export function resolveSectionBackgroundStyle(
  settings?: SectionBackgroundSettings | null,
): CSSProperties | undefined {
  if (!settings || !settings.mode || settings.mode === "auto") {
    return undefined;
  }
  const style: CSSProperties = {};
  if (settings.mode === "none") {
    style.backgroundColor = "transparent";
    (style as Record<string, string>).backgroundImage = "none";
    (style as Record<string, string>).boxShadow = "none";
    return style;
  }
  if (settings.mode === "solid" && settings.color) {
    style.backgroundColor = settings.color;
    (style as Record<string, string>).backgroundImage = "none";
  }
  if (settings.mode === "image" && settings.imageUrl) {
    style.backgroundImage = `url(${settings.imageUrl})`;
    (style as Record<string, string>).backgroundSize = "cover";
    (style as Record<string, string>).backgroundPosition = "center";
    (style as Record<string, string>).backgroundRepeat = "no-repeat";
  }
  return Object.keys(style).length > 0 ? style : undefined;
}

export function SectionBackground({ settings, children, className }: SectionBackgroundProps) {
  const mode = settings?.mode ?? "auto";
  if (mode === "auto") {
    return <div className={cn("w-full", className)}>{children}</div>;
  }
  if (mode === "none") {
    const style = resolveSectionBackgroundStyle(settings);
    return (
      <div className={cn("w-full", className)} style={style}>
        {children}
      </div>
    );
  }

  const style = resolveSectionBackgroundStyle(settings);

  return (
    <div className={cn("w-full", className)} style={style}>
      {children}
    </div>
  );
}
