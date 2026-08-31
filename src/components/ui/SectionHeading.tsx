import { Eyebrow } from "@/components/ui/Eyebrow";
import { sectionTitleClassName } from "@/lib/constants";
import type { SectionTextAlignment } from "@/lib/section-layout";
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
  const hasOffset = typeof headingOffset === "number" && headingOffset !== 0;
  const safeOffset = Math.max(-120, Math.min(120, headingOffset ?? 0));
  const hasSubtitle = Boolean(subtitle?.trim());
  const gapBelow = typeof headingGap === "number" ? headingGap : 16;
  // headingGap controls distance from heading block (including subtitle) to following body content.
  // Internal gap between title and subtitle is half the heading gap (or 8px when subtitle exists) — no artificial gap when no subtitle.
  const innerGap = hasSubtitle ? Math.max(4, Math.round(gapBelow / 2)) : 0;
  return (
    <div
      className={cn(
        "max-w-2xl",
        // Text alignment controls body only — heading position is independent via headingOffset
        hasOffset ? "mx-auto text-center max-w-[calc(100vw-2rem)] sm:max-w-2xl" : alignClasses[align],
        className,
      )}
      style={{
        ...(hasOffset ? ({ overflow: "visible" } as React.CSSProperties) : {}),
        // Gap below heading block to body — 0 means no gap at all
        marginBottom: `${gapBelow}px`,
      }}
    >
      {eyebrow ? <Eyebrow className="mb-1">{eyebrow}</Eyebrow> : null}
      <h2
        id={titleId}
        className={cn(
          sectionTitleClassName,
          size === "large" && "sm:text-5xl lg:text-[3.5rem]",
        )}
        style={
          hasOffset
            ? ({
                transform: `translateX(${safeOffset}px)`,
                marginBottom: hasSubtitle ? `${innerGap}px` : undefined,
                maxWidth: "100%",
              } as React.CSSProperties)
            : hasSubtitle
              ? ({ marginBottom: `${innerGap}px` } as React.CSSProperties)
              : undefined
        }
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className="text-base leading-[var(--leading-calm)] text-muted sm:text-lg"
          style={
            hasOffset
              ? ({ transform: `translateX(${safeOffset}px)` } as React.CSSProperties)
              : undefined
          }
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
