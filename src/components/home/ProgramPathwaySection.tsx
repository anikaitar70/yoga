"use client";

import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useLayoutOverride } from "@/components/content/sections/LayoutOverrideContext";
import { hasSectionLogo } from "@/lib/section-branding";
import { resolveImageSide } from "@/lib/section-layout";
import { imageFrameClassName } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type ProgramPathway = {
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  ctaLabel: string;
  imageSrc: string;
  imageAlt: string;
  highlights?: string[];
  variant?: "default" | "warm" | "muted";
  imageSide?: "left" | "right";
  sectionLogoSrc?: string;
  sectionLogoAlt?: string;
};

type ProgramPathwaySectionProps = {
  pathway: ProgramPathway;
};

const variantMap = {
  default: "default" as const,
  warm: "warm" as const,
  muted: "muted" as const,
};

export function ProgramPathwaySection({ pathway }: ProgramPathwaySectionProps) {
  const layoutOverride = useLayoutOverride();
  const imageSide = resolveImageSide(
    layoutOverride ?? { imageSide: pathway.imageSide },
    "IMAGE_TEXT",
    pathway.imageSide ?? "left",
  );
  const imageOrder = imageSide === "right" ? "lg:order-2" : "lg:order-1";
  const textOrder = imageSide === "right" ? "lg:order-1" : "lg:order-2";
  const sectionLogo = hasSectionLogo(pathway)
    ? {
        src: pathway.sectionLogoSrc!.trim(),
        alt: pathway.sectionLogoAlt?.trim() || pathway.title,
      }
    : null;

  return (
    <Section border="subtle" variant={variantMap[pathway.variant ?? "default"]} spacing="loose">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <ScrollReveal
            animation={imageSide === "right" ? "slide-right" : "slide-left"}
            className={cn(imageOrder, "min-w-0")}
          >
            <Link href={pathway.href} className="group block">
              <div className={cn(imageFrameClassName, "image-vignette aspect-[5/6]")}>
                <Image
                  src={pathway.imageSrc}
                  alt={pathway.imageAlt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  unoptimized={pathway.imageSrc.startsWith("/uploads/")}
                />
              </div>
            </Link>
          </ScrollReveal>

          <ScrollReveal animation="rise" className={cn(textOrder, "min-w-0")}>
            <div className="relative">
              {sectionLogo ? (
                <div className="mb-4 flex justify-end sm:absolute sm:right-0 sm:top-0 sm:mb-0">
                  <Image
                    src={sectionLogo.src}
                    alt={sectionLogo.alt}
                    width={320}
                    height={80}
                    className="h-auto max-h-16 w-auto max-w-[min(100%,12rem)] object-contain object-right"
                    unoptimized={
                      sectionLogo.src.startsWith("/uploads/") || sectionLogo.src.endsWith(".svg")
                    }
                  />
                </div>
              ) : null}
              {pathway.eyebrow ? (
                <p className="text-[0.7rem] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-primary-muted">
                  {pathway.eyebrow}
                </p>
              ) : null}
              <h2 className="mt-4 font-display text-3xl font-medium tracking-[var(--tracking-display)] text-foreground sm:text-4xl">
                {pathway.title}
              </h2>
              {pathway.subtitle ? (
                <p className="mt-3 text-lg text-muted">{pathway.subtitle}</p>
              ) : null}
            </div>
            <p className="mt-6 text-base leading-[var(--leading-calm)] text-muted">
              {pathway.description}
            </p>
            {pathway.highlights?.length ? (
              <ul className="mt-6 space-y-2">
                {pathway.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-foreground/85">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="mt-8">
              <Button href={pathway.href} variant="warm">
                {pathway.ctaLabel}
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </Section>
  );
}
