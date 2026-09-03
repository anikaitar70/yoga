import { Eyebrow } from "@/components/ui/Eyebrow";
import { sectionTitleClassName } from "@/lib/constants";
import type { SectionTextAlignment } from "@/lib/section-layout";
import { headingPositionStyle } from "@/lib/section-layout";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: SectionTextAlignment;
  className?: string;
  titleId?: string;
  size?: "default" | "large";
  headingOffset?: number;
  headingGap?: number;
};

const alignClasses: Record<SectionTextAlignment, string> = {
  left: "",
  center: "mx-auto text-center",
  right: "ml-auto text-right",
  justify: "mx-auto text-justify",
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
  titleId,
  size = "default",
  headingOffset = 0,
  headingGap,
}: SectionHeadingProps) {
  void align;
  const hasSubtitle = Boolean(subtitle?.trim());
  const gapValue = typeof headingGap === "number" ? headingGap : 16;
  const headingPos = headingPositionStyle(headingOffset);
  const subtitlePos = headingPositionStyle(headingOffset);
  // Gap below heading: if subtitle exists, gap is between heading and subtitle; else gap is below heading block to body
  return (
    <div
      className={cn("max-w-2xl w-full", className)}
      style={{
        overflow: "clip",
        overflowClipMargin: "0px",
        ...(!hasSubtitle ? { marginBottom: `${gapValue}px` } : {}),
      } as React.CSSProperties}
    >
      {eyebrow ? <Eyebrow className="mb-3">{eyebrow}</Eyebrow> : null}
      <h2
        id={titleId}
        className={cn(sectionTitleClassName, size === "large" && "sm:text-5xl lg:text-[3.5rem]")}
        style={{
          ...headingPos,
          ...(hasSubtitle ? { marginBottom: `${gapValue}px` } as React.CSSProperties : {}),
        }}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className="text-base leading-[var(--leading-calm)] text-muted sm:text-lg"
          style={subtitlePos}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
