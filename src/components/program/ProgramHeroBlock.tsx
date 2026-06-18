"use client";

import Image from "next/image";
import type { PageSectionRecord } from "@/lib/page-section-types";
import { contentToParagraphs } from "@/lib/page-section-types";
import { resolveHeroDisplay } from "@/lib/hero-section-display";
import { resolveSectionLayout } from "@/lib/section-layout";
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
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { displayHeadingClassName } from "@/lib/constants";
import { cn } from "@/lib/utils";

type ProgramHeroBlockProps = {
  section: PageSectionRecord;
  sectionIndex?: number;
};

export function ProgramHeroBlock({ section, sectionIndex = 0 }: ProgramHeroBlockProps) {
  const theme = useProgramTheme();
  const override = useLayoutOverride();
  const { isLivePreview, numerics } = usePreviewLayoutMetrics(section.layout, "HERO");
  const layout = resolveSectionLayout(override ?? section.layout);
  const hero = resolveHeroDisplay(section);
  const paragraphs = contentToParagraphs(section.content);
  const hasImage = Boolean(section.imageUrl);

  if (hasImage) {
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
              {section.subtitle ? <Eyebrow>{section.subtitle}</Eyebrow> : null}
              <p className="mt-2 text-xs font-medium tracking-wide text-muted">{hero.tagline}</p>
              {section.title ? (
                <h1 className={cn(displayHeadingClassName, "mt-5 max-w-xl")}>{section.title}</h1>
              ) : null}
              {paragraphs.length ? (
                <div className="mt-6 max-w-lg space-y-4 text-base leading-[var(--leading-calm)] text-muted">
                  {paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              ) : null}
              <div className="mt-10 flex flex-wrap gap-3">
                <Button href={hero.primaryCta.href} variant={theme.ctaVariant}>
                  {hero.primaryCta.label}
                </Button>
                {hero.showSecondaryCta ? (
                  <Button href={hero.secondaryCta.href} variant="secondary">
                    {hero.secondaryCta.label}
                  </Button>
                ) : null}
              </div>
            </MotionReveal>
          </Container>
          <MotionReveal variant="scale" delay={120} className="relative min-h-[280px] lg:min-h-full">
            <div
              className={cn("relative h-full min-h-[280px] overflow-hidden", !isLivePreview && layout.imageAspect)}
              style={isLivePreview ? previewImageStyle(numerics) : undefined}
            >
              <Image
                src={section.imageUrl!}
                alt={section.imageAlt || section.title || ""}
                fill
                priority
                className="object-cover"
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
          {section.subtitle ? <Eyebrow className="justify-center">{section.subtitle}</Eyebrow> : null}
          <p className="mt-2 text-xs font-medium tracking-wide text-muted">{hero.tagline}</p>
          {section.title ? (
            <h1 className={cn(displayHeadingClassName, "mt-5")}>{section.title}</h1>
          ) : null}
          {paragraphs.length ? (
            <div
              className={cn(
                "mx-auto mt-6 space-y-4 text-base leading-[var(--leading-calm)] text-muted",
                !isLivePreview && layout.textMaxWidth,
              )}
              style={isLivePreview ? previewTextStyle(numerics) : undefined}
            >
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          ) : null}
        </MotionReveal>
      </div>
    </ProgramSectionShell>
  );
}
