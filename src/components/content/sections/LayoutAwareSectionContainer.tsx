"use client";



import type { ReactNode } from "react";

import { resolveSectionLayout, type SectionLayoutSettings } from "@/lib/section-layout";
import { useLayoutOverride } from "@/components/content/sections/LayoutOverrideContext";

import {

  previewContentStyle,

  previewTextStyle,

  usePreviewLayoutMetrics,

} from "@/components/content/sections/usePreviewLayoutMetrics";

import { cn } from "@/lib/utils";



type LayoutAwareSectionContainerProps = {

  layout?: SectionLayoutSettings | null;

  children: ReactNode;

  className?: string;

  width?: "content" | "text";

  sectionType?: string;

};



export function LayoutAwareSectionContainer({

  layout,

  children,

  className,

  width = "content",

  sectionType = "CUSTOM_TEXT",

}: LayoutAwareSectionContainerProps) {
  const override = useLayoutOverride();
  const { isLivePreview, numerics } = usePreviewLayoutMetrics(layout, sectionType);
  const resolved = resolveSectionLayout(override ?? layout);

  const widthClass = width === "text" ? resolved.textMaxWidth : resolved.contentWidth;



  return (

    <div

      className={cn(isLivePreview ? "w-full mx-auto" : widthClass, className)}

      style={

        isLivePreview

          ? width === "text"

            ? previewTextStyle(numerics)

            : previewContentStyle(numerics)

          : undefined

      }

    >

      {children}

    </div>

  );

}


