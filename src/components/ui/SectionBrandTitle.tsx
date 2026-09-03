import type { BrandKey } from "@/lib/site-branding";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { headingPositionStyle } from "@/lib/section-layout";
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
    const gapValue = typeof headingGap === "number" ? headingGap : 16;
    const hasSubtitle = Boolean(subtitle?.trim());
    const brandPos = headingPositionStyle(headingOffset);
    return (
      <div
        className={cn("flex w-full max-w-2xl overflow-clip", className)}
        style={{
          marginBottom: hasSubtitle ? undefined : `${gapValue}px`,
        } as React.CSSProperties}
      >
        <div style={brandPos} className="max-w-[min(100%,16rem)]">
          <BrandLogo brand={titleBrand} context="hero" className="w-full" priority />
        </div>
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
