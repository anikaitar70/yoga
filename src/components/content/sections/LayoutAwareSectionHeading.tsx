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
  return (
    <SectionHeading
      title={title}
      subtitle={subtitle}
      align={sectionHeadingAlign(effective)}
      className={className}
      size={size}
    />
  );
}
