"use client";



import type { ReactNode } from "react";

import { Prose } from "@/components/ui/Prose";

import { resolveSectionLayout, type SectionLayoutSettings } from "@/lib/section-layout";

import { useLayoutOverride } from "@/components/content/sections/LayoutOverrideContext";
import { previewTextStyle, usePreviewLayoutMetrics } from "@/components/content/sections/usePreviewLayoutMetrics";

import { cn } from "@/lib/utils";



type LayoutAwareProseProps = {

  layout?: SectionLayoutSettings | null;

  children: ReactNode;

  className?: string;

  sectionType?: string;

};



export function LayoutAwareProse({

  layout,

  children,

  className,

  sectionType = "CUSTOM_TEXT",

}: LayoutAwareProseProps) {
  const override = useLayoutOverride();
  const effective = override ?? layout;
  const { isLivePreview, numerics } = usePreviewLayoutMetrics(layout, sectionType);
  const resolved = resolveSectionLayout(effective);
  const textAlignment = effective?.textAlignment === "center" ? "center" : "left";



  return (

    <Prose

      className={cn(

        isLivePreview ? resolved.textAlignment : cn(resolved.textMaxWidth, resolved.textAlignment),

        className,

      )}

      style={isLivePreview ? previewTextStyle(numerics, textAlignment) : undefined}

    >

      {children}

    </Prose>

  );

}


