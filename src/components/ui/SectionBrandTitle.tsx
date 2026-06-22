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
};

/** Section heading that can show a brand logo instead of plain text. */
export function SectionBrandTitle({
  titleBrand,
  title,
  subtitle,
  align = "left",
  className,
}: SectionBrandTitleProps) {
  if (titleBrand) {
    return (
      <div
        className={cn(
          "mb-10 flex",
          align === "center" ? "justify-center" : "justify-start",
          className,
        )}
      >
        <BrandLogo
          brand={titleBrand}
          context="hero"
          className="max-w-[min(100%,16rem)]"
          priority
        />
        {subtitle ? (
          <p className="sr-only">{subtitle}</p>
        ) : null}
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
    />
  );
}
