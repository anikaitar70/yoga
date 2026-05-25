import { fetchAboutPreview } from "@/content";
import { SplitMediaLayout } from "@/components/content/SplitMediaLayout";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";

export async function AboutPreview() {
  const about = await fetchAboutPreview();

  return (
    <Section border="bottom">
      <Container>
        <SplitMediaLayout
          image={{
            src: about.imageSrc,
            alt: about.imageAlt,
          }}
        >
          <div>
            <Eyebrow>About</Eyebrow>
            <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
              {about.heading}
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted">{about.body}</p>
            <div className="mt-8">
              <Button href={about.linkHref} variant="secondary">
                {about.linkLabel}
              </Button>
            </div>
          </div>
        </SplitMediaLayout>
      </Container>
    </Section>
  );
}
