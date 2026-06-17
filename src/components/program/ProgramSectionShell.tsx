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
  resolveSectionLayout,
  resolveSectionStyleClass,
} from "@/lib/section-layout";
import { useLayoutOverride } from "@/components/content/sections/LayoutOverrideContext";
import { MotionReveal, MotionStagger, type MotionVariant } from "@/components/program/MotionReveal";
import { ProgramSectionAccent } from "@/components/program/ProgramDecorations";
import { useProgramTheme } from "@/components/program/ProgramThemeProvider";
import { Container } from "@/components/ui/Container";
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

/** Unwrap a single layout wrapper so stagger can target multiple content blocks. */
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
  const effectiveLayout = override ?? layout;
  const resolved = resolveSectionLayout(effectiveLayout);
  const cssVars = layoutToCssVariables(effectiveLayout, sectionType);
  const styleClass = resolveSectionStyleClass(effectiveLayout?.sectionStyle);
  const animationPreset = effectiveLayout?.animationPreset ?? "rise";
  const isStagger = animationPreset === "stagger";
  const animation = motionFromPreset(animationPreset);

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
        resolved.sectionPadding,
        theme.sectionRhythm,
        styleClass,
        border === "subtle" && "border-b border-border/40",
        border === "bottom" && "border-b border-border/70",
        className,
      )}
    >
      <ProgramSectionAccent index={sectionIndex} />
      {fullBleed ? content : <Container className="relative">{content}</Container>}
    </section>
  );

  const gapStyle =
    typeof effectiveLayout?.sectionGap === "number" && effectiveLayout.sectionGap > 0
      ? { marginBottom: `${effectiveLayout.sectionGap}px` }
      : undefined;

  return (
    <div style={{ ...cssVars, ...gapStyle }} className={theme.shellClass}>
      {isStagger || animation === "none" ? (
        sectionBody
      ) : (
        <MotionReveal variant={animation}>{sectionBody}</MotionReveal>
      )}
    </div>
  );
}
