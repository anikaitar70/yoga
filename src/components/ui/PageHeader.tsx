import type { ReactNode } from "react";
import type { PageIntro } from "@/content/types";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { displayHeadingClassName } from "@/lib/constants";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { cn } from "@/lib/utils";

type PageHeaderProps = PageIntro & {
  titleAs?: "h1" | "h2";
  as?: "section" | "header";
  className?: string;
  breadcrumbs?: ReactNode;
  /** Optional supplementary content (e.g. a calendar widget) shown beside the title on desktop, below it on mobile. */
  aside?: ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  titleAs = "h2",
  as = "section",
  className,
  breadcrumbs,
  aside,
}: PageHeaderProps) {
  if (titleAs === "h1") {
    const titleBlock = (
      <div className={aside ? "min-w-0 flex-1" : undefined}>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h1 className={cn(displayHeadingClassName, "mt-5 max-w-3xl")}>{title}</h1>
        {subtitle ? (
          <p className="mt-6 max-w-2xl text-lg leading-[var(--leading-calm)] text-muted">
            {subtitle}
          </p>
        ) : null}
      </div>
    );

    return (
      <Section
        as={as}
        variant="immersive"
        spacing="pageHero"
        border="subtle"
        className={className}
      >
        <Container>
          <ScrollReveal animation="rise">
            {breadcrumbs}
            {aside ? (
              <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
                {titleBlock}
                <div className="w-full shrink-0 lg:w-auto">{aside}</div>
              </div>
            ) : (
              titleBlock
            )}
          </ScrollReveal>
        </Container>
      </Section>
    );
  }

  return (
    <Section
      as={as}
      variant="immersive"
      spacing="pageHero"
      border="subtle"
      className={className}
    >
        <Container>
          <ScrollReveal animation="rise">
            {breadcrumbs}
            <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} size="large" />
        </ScrollReveal>
      </Container>
    </Section>
  );
}
