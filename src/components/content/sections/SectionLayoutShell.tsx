"use client";

import type { ReactNode } from "react";
import type { SectionLayoutSettings } from "@/lib/section-layout";
import {
  layoutToCssVariables,
  resolveSectionLayout,
  resolveSectionStyleClass,
} from "@/lib/section-layout";
import { useLayoutOverride } from "@/components/content/sections/LayoutOverrideContext";
import { Section } from "@/components/ui/Section";
import { Children } from "react";
import { ScrollReveal, StaggerReveal } from "@/components/ui/ScrollReveal";
import { cn } from "@/lib/utils";

type SectionLayoutShellProps = {
  layout?: SectionLayoutSettings | null;
  sectionType?: string;
  children: ReactNode;
  className?: string;
  border?: "none" | "bottom" | "subtle";
  variant?: "default" | "muted" | "card" | "warm" | "immersive";
  spacing?: "default" | "loose" | "none" | "immersive" | "pageHero";
};

/** Applies preset + numeric layout tokens via CSS variables. */
export function SectionLayoutShell({
  layout,
  sectionType = "CUSTOM_TEXT",
  children,
  className,
  border = "subtle",
  variant = "default",
  spacing = "loose",
}: SectionLayoutShellProps) {
  const override = useLayoutOverride();
  const effectiveLayout = override ?? layout;
  const usesLayoutTokens = Boolean(override || layout);
  const resolved = usesLayoutTokens ? resolveSectionLayout(effectiveLayout) : null;
  const cssVars = usesLayoutTokens ? layoutToCssVariables(effectiveLayout, sectionType) : {};
  const styleClass = resolveSectionStyleClass(effectiveLayout?.sectionStyle);
  const animation = effectiveLayout?.animationPreset ?? "rise";

  const sectionClassName = cn(
    usesLayoutTokens ? resolved?.sectionPadding : undefined,
    styleClass,
    className,
  );

  const content = (
    <Section border={border} spacing={usesLayoutTokens ? "none" : spacing} variant={variant} className={sectionClassName}>
      {children}
    </Section>
  );

  return (
    <div style={cssVars}>
      {animation === "none" || !usesLayoutTokens ? (
        content
      ) : animation === "stagger" ? (
        <Section border={border} spacing="none" variant={variant} className={sectionClassName}>
          <StaggerReveal animation="rise" staggerMs={80}>
            {Children.toArray(children)}
          </StaggerReveal>
        </Section>
      ) : (
        <ScrollReveal animation={animation}>{content}</ScrollReveal>
      )}
    </div>
  );
}
