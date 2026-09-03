import type { BrandKey } from "@/lib/site-branding";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

type SectionBrandTitleProps = {
  titleBrand?: BrandKey;
  title?: string | null;
  subtitle?: string | null;
  align?: "left" | "center";
  className?: string;
  headingOffset?: number;
  headingGap?: number;
};

/** Section heading that can show a brand logo instead of plain text. */
export function SectionBrandTitle({
  titleBrand,
  title,
  subtitle,
  align = "left",
  className,
  headingOffset,
  headingGap,
}: SectionBrandTitleProps) {
  if (titleBrand) {
    const hasOffset = typeof headingOffset === "number" && headingOffset !== 0;
    const safeOffset = Math.max(-100, Math.min(100, headingOffset ?? 0));
    const gapValue = typeof headingGap === "number" ? headingGap : 16;
    const hasSubtitle = Boolean(subtitle?.trim());
    return (
      <div
        className={cn(
          "flex",
          align === "center" ? "justify-center" : "justify-start",
          className,
        )}
        style={{
          ...(hasOffset ? { transform: `translateX(${safeOffset}px)`, maxWidth: "100%" } as React.CSSProperties : {}),
          marginBottom: hasSubtitle ? undefined : `${gapValue}px`,
        }}
      >
        <BrandLogo brand={titleBrand} context="hero" className="max-w-[min(100%,16rem)]" priority />
        {subtitle ? <p className="sr-only">{subtitle}</p> : null}
      </div>
    );
  }

  if (!title && !subtitle) return null;

  return (
    <SectionHeading
      title={title || ""}
      subtitle={subtitle || undefined}
      align={align}
      className={cn("mb-10", className)}
      headingOffset={headingOffset}
      headingGap={headingGap}
    />
  );
}
