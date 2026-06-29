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
};

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  titleAs = "h2",
  as = "section",
  className,
  breadcrumbs,
}: PageHeaderProps) {
  if (titleAs === "h1") {
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
            {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
            <h1 className={cn(displayHeadingClassName, "mt-5 max-w-3xl")}>{title}</h1>
            {subtitle ? (
              <p className="mt-6 max-w-2xl text-lg leading-[var(--leading-calm)] text-muted">
                {subtitle}
              </p>
            ) : null}
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
