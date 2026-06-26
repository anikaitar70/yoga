"use client";

import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import type { SectionLayoutSettings } from "@/lib/section-layout";
import {
  layoutToCssVariables,
  resolveSectionStyleClass,
  sectionPaddingStyleFromLayout,
} from "@/lib/section-layout";
import { useLayoutOverride } from "@/components/content/sections/LayoutOverrideContext";
import { DesignSettingsSectionScope } from "@/components/design/DesignSettingsSectionScope";
import {
  previewContentStyle,
  usePreviewLayoutMetrics,
} from "@/components/content/sections/usePreviewLayoutMetrics";
import { MotionReveal, MotionStagger, type MotionVariant } from "@/components/program/MotionReveal";
import { useProgramTheme } from "@/components/program/ProgramThemeProvider";
import { cn } from "@/lib/utils";

type ProgramSectionShellProps = {
  layout?: SectionLayoutSettings | null;
  sectionType?: string;
  sectionIndex?: number;
  children: ReactNode;
  className?: string;
  border?: "none" | "bottom" | "subtle";
  fullBleed?: boolean;
};

function motionFromPreset(preset?: string): MotionVariant {
  if (preset === "fade") return "fade";
  if (preset === "none") return "none";
  if (preset === "stagger") return "rise";
  return "rise";
}

function staggerableChildren(children: ReactNode): ReactNode[] {
  const top = Children.toArray(children);
  if (top.length === 1 && isValidElement(top[0])) {
    const el = top[0] as ReactElement<{ children?: ReactNode }>;
    const inner = Children.toArray(el.props.children);
    if (inner.length > 1) return inner;
  }
  return top;
}

export function ProgramSectionShell({
  layout,
  sectionType = "CUSTOM_TEXT",
  sectionIndex = 0,
  children,
  className,
  border = "subtle",
  fullBleed = false,
}: ProgramSectionShellProps) {
  const theme = useProgramTheme();
  const override = useLayoutOverride();
  const { isLivePreview, numerics } = usePreviewLayoutMetrics(layout, sectionType);
  const effectiveLayout = override ?? layout;
  const cssVars = isLivePreview ? {} : layoutToCssVariables(effectiveLayout, sectionType);
  const sectionPaddingStyle = isLivePreview
    ? undefined
    : sectionPaddingStyleFromLayout(effectiveLayout, sectionType);
  const styleClass = resolveSectionStyleClass(effectiveLayout?.sectionStyle);
  const animationPreset = effectiveLayout?.animationPreset ?? "rise";
  const isStagger = animationPreset === "stagger" && !isLivePreview;
  const animation = isLivePreview ? "none" : motionFromPreset(animationPreset);

  const content = isStagger ? (
    <MotionStagger variant="rise" stagger={0.1}>
      {staggerableChildren(children)}
    </MotionStagger>
  ) : (
    children
  );

  const sectionBody = (
    <section
      className={cn(
        "relative",
        isLivePreview ? undefined : theme.sectionRhythm,
        styleClass,
        border === "subtle" && "border-b border-border/40",
        border === "bottom" && "border-b border-border/70",
        className,
      )}
      style={sectionPaddingStyle}
    >
      {fullBleed ? (
        content
      ) : (
        <div
          className={cn("relative mx-auto w-full px-4 sm:px-6", !isLivePreview && "max-w-[var(--content-max-w,72rem)]")}
          style={isLivePreview ? previewContentStyle(numerics) : undefined}
        >
          {content}
        </div>
      )}
    </section>
  );

  return (
    <DesignSettingsSectionScope overrides={effectiveLayout?.designOverrides}>
      <div style={cssVars} className={theme.shellClass}>
        {isStagger || animation === "none" ? sectionBody : <MotionReveal variant={animation}>{sectionBody}</MotionReveal>}
      </div>
    </DesignSettingsSectionScope>
  );
}
