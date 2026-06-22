"use client";

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { HeroMedia } from "@/components/home/HeroMedia";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useDesignSettings } from "@/components/design/DesignSettingsProvider";
import type { HeroContent } from "@/content/types";
import { displayHeadingClassName } from "@/lib/constants";
import { cn } from "@/lib/utils";

type HeroSectionViewProps = {
  hero: HeroContent;
  className?: string;
};

const heroAlignmentClasses = {
  left: "items-start text-left",
  center: "items-center text-center",
  right: "items-end text-right",
} as const;

/** Presentational homepage hero — shared by public page and admin preview. */
export function HeroSectionView({ hero, className }: HeroSectionViewProps) {
  const { heroLayout } = useDesignSettings();
  const alignment = heroLayout.logoAlignment;
  const alignClass = heroAlignmentClasses[alignment];

  return (
    <section
      className={cn("relative overflow-hidden border-b border-border/50 texture-grain", className)}
      style={{
        minHeight: "min(var(--home-hero-min-h, 90vh), 820px)",
      }}
    >
      <div className="grid min-h-[inherit] lg:grid-cols-[1fr_1.1fr]">
        <div
          className="relative z-10 flex flex-col justify-center px-4 sm:px-6 lg:px-10"
          style={{
            paddingTop: "var(--home-hero-py, 5rem)",
            paddingBottom: "var(--home-hero-py, 5rem)",
          }}
        >
          <Container className={cn("max-w-xl px-0", alignment === "center" && "mx-auto")}>
            <div className={cn("flex w-full flex-col", alignClass)}>
              <ScrollReveal animation="fade" duration={800}>
                <BrandLogo
                  context="hero"
                  className={cn(
                    "max-w-[11rem]",
                    alignment === "center" && "mx-auto self-center",
                    alignment === "right" && "ml-auto self-end",
                  )}
                  priority
                />
              </ScrollReveal>
              <ScrollReveal animation="rise" delay={120}>
                <h1
                  className={cn(
                    displayHeadingClassName,
                    "mt-5 max-w-lg",
                    alignment === "center" && "mx-auto",
                    alignment === "right" && "ml-auto",
                  )}
                >
                  {hero.title || "Hero title"}
                </h1>
              </ScrollReveal>
              <ScrollReveal animation="rise" delay={240}>
                <p
                  className={cn(
                    "mt-7 max-w-md text-base leading-[var(--leading-calm)] text-muted sm:text-lg",
                    alignment === "center" && "mx-auto",
                    alignment === "right" && "ml-auto",
                  )}
                >
                  {hero.subtitle || "Hero subtitle"}
                </p>
              </ScrollReveal>
              <ScrollReveal animation="rise" delay={360}>
                <div
                  className={cn(
                    "mt-10 flex flex-wrap gap-3",
                    alignment === "center" && "justify-center",
                    alignment === "right" && "justify-end",
                  )}
                >
                  <Button href={hero.primaryCta.href} variant="warm">
                    {hero.primaryCta.label || "Primary"}
                  </Button>
                  <Button href={hero.secondaryCta.href} variant="secondary">
                    {hero.secondaryCta.label || "Secondary"}
                  </Button>
                </div>
              </ScrollReveal>
            </div>
          </Container>
        </div>
        <ScrollReveal animation="scale" delay={200} className="relative min-h-[320px] lg:min-h-0">
          <HeroMedia hero={hero} />
        </ScrollReveal>
      </div>
    </section>
  );
}
