"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  sectionHeadingAlign,
  useEffectiveSectionLayout,
} from "@/components/content/sections/useEffectiveSectionLayout";
import type { SectionLayoutSettings } from "@/lib/section-layout";

type LayoutAwareSectionHeadingProps = {
  title: string;
  subtitle?: string;
  layout?: SectionLayoutSettings | null;
  className?: string;
  size?: "default" | "large";
};

export function LayoutAwareSectionHeading({
  title,
  subtitle,
  layout,
  className,
  size = "default",
}: LayoutAwareSectionHeadingProps) {
  const effective = useEffectiveSectionLayout(layout);
  // Heading position is independent of body text alignment — controlled solely by headingOffset/headingGap
  return (
    <SectionHeading
      title={title}
      subtitle={subtitle}
      align="left"
      className={className}
      size={size}
      headingOffset={effective.headingOffset}
      headingGap={effective.headingGap}
    />
  );
}
