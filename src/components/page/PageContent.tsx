import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

type PageContentProps = {
  children: React.ReactNode;
  spacing?: "default" | "pageHero" | "loose";
  border?: "none" | "bottom";
};

export function PageContent({
  children,
  spacing = "pageHero",
  border = "bottom",
}: PageContentProps) {
  return (
    <Section spacing={spacing} border={border}>
      <Container>{children}</Container>
    </Section>
  );
}
