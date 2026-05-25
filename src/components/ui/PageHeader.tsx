import type { PageIntro } from "@/content/types";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

type PageHeaderProps = PageIntro & {
  /** Use h1 for standalone pages; SectionHeading uses h2 by default. */
  titleAs?: "h1" | "h2";
  as?: "section" | "header";
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  titleAs = "h2",
  as = "section",
  className,
}: PageHeaderProps) {
  if (titleAs === "h1") {
    return (
      <Section
        as={as}
        variant="muted"
        spacing="pageHero"
        border="bottom"
        className={className}
      >
        <Container>
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
              {subtitle}
            </p>
          ) : null}
        </Container>
      </Section>
    );
  }

  return (
    <Section
      as={as}
      variant="muted"
      spacing="pageHero"
      border="bottom"
      className={className}
    >
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
      </Container>
    </Section>
  );
}
