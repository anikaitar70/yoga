"use client";

import Image from "next/image";
import type { PageSectionRecord } from "@/lib/page-section-types";
import { resolveHeroDisplay } from "@/lib/hero-section-display";
import { resolveSectionLayout } from "@/lib/section-layout";
import { RichHtml } from "@/components/content/RichHtml";
import { useLayoutOverride } from "@/components/content/sections/LayoutOverrideContext";
import {
  previewContentStyle,
  previewImageStyle,
  previewTextStyle,
  usePreviewLayoutMetrics,
} from "@/components/content/sections/usePreviewLayoutMetrics";
import { ProgramSectionShell } from "@/components/program/ProgramSectionShell";
import { ProgramHeroDecoration } from "@/components/program/ProgramDecorations";
import { MotionReveal } from "@/components/program/MotionReveal";
import { useProgramTheme } from "@/components/program/ProgramThemeProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { displayHeadingClassName } from "@/lib/constants";
import {
  headingPositionStyle,
  imagePositionToCss,
  resolveImageFit,
  resolveImagePosition,
} from "@/lib/section-layout";
import { cn } from "@/lib/utils";

type ProgramHeroBlockProps = {
  section: PageSectionRecord;
  sectionIndex?: number;
};

export function ProgramHeroBlock({ section, sectionIndex = 0 }: ProgramHeroBlockProps) {
  const theme = useProgramTheme();
  const { localizePath } = useLocale();
  const override = useLayoutOverride();
  const { isLivePreview, numerics } = usePreviewLayoutMetrics(section.layout, "HERO");
  const layout = resolveSectionLayout(override ?? section.layout);
  const hero = resolveHeroDisplay(section);
  const hasImage = Boolean(section.imageUrl);

  if (hasImage) {
    const effectiveLayout = override ?? section.layout;
    const imageFit = resolveImageFit(effectiveLayout);
    const imagePos = resolveImagePosition(effectiveLayout);
    const isContain = imageFit === "contain";
    const headingOffset = effectiveLayout?.headingOffset ?? null;
    const headingGap = typeof effectiveLayout?.headingGap === "number" ? effectiveLayout.headingGap : 16;
    const hasContent = Boolean(section.content?.trim());
    // Use effectiveLayout for height so preview slider updates both live and preview consistently.
    const effectiveImageHeight =
      typeof effectiveLayout?.imageHeight === "number" && effectiveLayout.imageHeight > 0 ? effectiveLayout.imageHeight : null;
    const liveHeightStyle =
      !isLivePreview && effectiveImageHeight ? { height: `${effectiveImageHeight}px`, minHeight: `${effectiveImageHeight}px` } : undefined;
    // In preview, always use height so banner-height slider matches live (live uses h-[var(--image-h)] = numerics.imageHeight).
    // Using aspectRatio (previewImageStyle) caused preview vs live mismatch for wide/landscape.
    const previewStyle: React.CSSProperties | undefined = isLivePreview
      ? { height: `${numerics.imageHeight}px`, minHeight: `${numerics.imageHeight}px`, position: "relative" as const }
      : undefined;
    return (
      <ProgramSectionShell
        layout={section.layout}
        sectionType="HERO"
        sectionIndex={sectionIndex}
        border="none"
        fullBleed
        className={cn("!px-0", theme.heroClass)}
      >
        <div className="relative grid min-h-[min(72vh,640px)] lg:grid-cols-2">
          <ProgramHeroDecoration />
          <Container className="relative z-10 flex flex-col justify-center py-16 sm:py-20 lg:py-24">
            <MotionReveal variant="rise">
              {section.subtitle ? (
                <Eyebrow style={effectiveLayout?.subtitleColor ? { color: effectiveLayout.subtitleColor } : undefined}>
                  {section.subtitle}
                </Eyebrow>
              ) : null}
              <p
                className="mt-2 text-xs font-medium tracking-wide text-muted"
                style={effectiveLayout?.subtitleColor ? { color: effectiveLayout.subtitleColor } : undefined}
              >
                {hero.tagline}
              </p>
              {section.title ? (
                <h1
                  className={cn(displayHeadingClassName, "mt-5 max-w-xl w-full overflow-clip")}
                  style={{
                    ...(headingOffset != null ? headingPositionStyle(headingOffset) : {}),
                    ...(hasContent ? { marginBottom: `${headingGap}px` } : {}),
                  }}
                >
                  {section.title}
                </h1>
              ) : null}
              {section.content ? (
                <div
                  className="max-w-lg space-y-4 text-base leading-[var(--leading-calm)] text-muted"
                  style={!hasContent ? undefined : section.title ? undefined : { marginTop: `${headingGap}px` }}
                >
                  <RichHtml html={section.content} />
                </div>
              ) : null}
              <div className="mt-10 flex flex-wrap gap-3">
                <Button href={localizePath(hero.primaryCta.href)} variant={theme.ctaVariant}>
                  {hero.primaryCta.label}
                </Button>
                {hero.showSecondaryCta ? (
                  <Button href={localizePath(hero.secondaryCta.href)} variant="secondary">
                    {hero.secondaryCta.label}
                  </Button>
                ) : null}
              </div>
            </MotionReveal>
          </Container>
          <MotionReveal variant="scale" delay={120} className="relative min-h-[280px] lg:min-h-full">
            <div
              className={cn(
                "relative h-full min-h-[280px] overflow-hidden",
                isContain ? "bg-card" : "",
                !isLivePreview && !liveHeightStyle && layout.imageAspect,
              )}
              style={isLivePreview ? previewStyle : liveHeightStyle}
            >
              <Image
                src={section.imageUrl!}
                alt={section.imageAlt || section.title || ""}
                fill
                priority
                className={isContain ? "object-contain p-2" : "object-cover"}
                style={{ objectPosition: imagePositionToCss(imagePos) }}
                sizes="(max-width: 1024px) 100vw, 50vw"
                unoptimized={section.imageUrl!.startsWith("/uploads/")}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent lg:bg-gradient-to-l lg:from-background/35" />
            </div>
          </MotionReveal>
        </div>
      </ProgramSectionShell>
    );
  }

  // No-image hero variant — also honor preview overrides for heading controls.
  const noImageEffective = override ?? section.layout;
  const noImageHeadingOffset = noImageEffective?.headingOffset ?? null;
  const noImageHeadingGap = typeof noImageEffective?.headingGap === "number" ? noImageEffective.headingGap : 16;
  const noImageHasContent = Boolean(section.content?.trim());
  return (
    <ProgramSectionShell
      layout={section.layout}
      sectionType="HERO"
      sectionIndex={sectionIndex}
      border="subtle"
      className={theme.heroClass}
    >
      <div
        className={cn(
          "relative mx-auto text-center",
          !isLivePreview && layout.contentWidth,
          layout.textAlignment,
        )}
        style={isLivePreview ? previewContentStyle(numerics) : undefined}
      >
        <ProgramHeroDecoration />
        <MotionReveal variant="rise">
          {section.subtitle ? (
            <Eyebrow
              className="justify-center"
              style={noImageEffective?.subtitleColor ? { color: noImageEffective.subtitleColor } : undefined}
            >
              {section.subtitle}
            </Eyebrow>
          ) : null}
          <p
            className="mt-2 text-xs font-medium tracking-wide text-muted"
            style={noImageEffective?.subtitleColor ? { color: noImageEffective.subtitleColor } : undefined}
          >
            {hero.tagline}
          </p>
          {section.title ? (
            <h1
              className={cn(displayHeadingClassName, "mt-5 w-full max-w-2xl overflow-clip mx-auto")}
              style={{
                ...(noImageHeadingOffset != null ? headingPositionStyle(noImageHeadingOffset) : {}),
                ...(noImageHasContent ? { marginBottom: `${noImageHeadingGap}px` } : {}),
              }}
            >
              {section.title}
            </h1>
          ) : null}
          {section.content ? (
            <div
              className={cn(
                "mx-auto space-y-4 text-base leading-[var(--leading-calm)] text-muted",
                !isLivePreview && layout.textMaxWidth,
              )}
              style={{
                ...(isLivePreview ? previewTextStyle(numerics) : {}),
                ...(section.title ? {} : { marginTop: `${noImageHeadingGap}px` }),
              }}
            >
              <RichHtml html={section.content} />
            </div>
          ) : null}
        </MotionReveal>
      </div>
    </ProgramSectionShell>
  );
}
