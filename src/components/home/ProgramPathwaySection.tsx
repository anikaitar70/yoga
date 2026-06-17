"use client";

import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useLayoutOverride } from "@/components/content/sections/LayoutOverrideContext";
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
            <SectionHeading
              eyebrow={pathway.eyebrow}
              title={pathway.title}
              subtitle={pathway.subtitle}
            />
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
