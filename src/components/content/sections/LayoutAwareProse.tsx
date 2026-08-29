"use client";



import type { CSSProperties, ReactNode } from "react";

import { Prose } from "@/components/ui/Prose";

import { resolveSectionLayout, type SectionLayoutSettings } from "@/lib/section-layout";
import { parseSectionTextStyle, sectionTextStyleToCss } from "@/lib/rich-text";

import { useLayoutOverride } from "@/components/content/sections/LayoutOverrideContext";
import { previewTextStyle, usePreviewLayoutMetrics } from "@/components/content/sections/usePreviewLayoutMetrics";

import { cn } from "@/lib/utils";



type LayoutAwareProseProps = {

  layout?: SectionLayoutSettings | null;

  children: ReactNode;

  className?: string;

  sectionType?: string;

  style?: CSSProperties;

};



export function LayoutAwareProse({

  layout,

  children,

  className,

  sectionType = "CUSTOM_TEXT",

  style,

}: LayoutAwareProseProps) {
  const override = useLayoutOverride();
  const effective = override ?? layout;
  const { isLivePreview, numerics } = usePreviewLayoutMetrics(layout, sectionType);
  const resolved = resolveSectionLayout(effective);
  const textAlignment = effective?.textAlignment === "center" ? "center" : "left";

  const textStyleCss = sectionTextStyleToCss(parseSectionTextStyle(effective?.textStyle));



  return (

    <Prose

      className={cn(

        isLivePreview ? resolved.textAlignment : cn(resolved.textMaxWidth, resolved.textAlignment),

        className,

      )}

      style={{ ...(isLivePreview ? previewTextStyle(numerics, textAlignment) : {}), ...(textStyleCss ?? {}), ...(style ?? {}) }}

    >

      {children}

    </Prose>

  );

}


