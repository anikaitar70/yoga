import Image from "next/image";
import type { BlogSection } from "@/lib/blog-sections";
import { Container } from "@/components/ui/Container";
import { Prose } from "@/components/ui/Prose";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SplitMediaLayout } from "@/components/content/SplitMediaLayout";
import { GalleryList } from "@/components/content/GalleryList";
import { cn } from "@/lib/utils";

type BlogSectionsRendererProps = {
  sections: BlogSection[];
  className?: string;
};

export function BlogSectionsRenderer({ sections, className }: BlogSectionsRendererProps) {
  if (sections.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-16", className)}>
      {sections.map((section) => {
        switch (section.type) {
          case "TEXT":
            return (
              <Container key={section.id}>
                {section.title ? <SectionHeading title={section.title} className="mb-6" /> : null}
                <Prose className="mx-auto max-w-2xl">
                  {section.paragraphs.filter(Boolean).map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </Prose>
              </Container>
            );
          case "IMAGE":
            if (!section.imageUrl) return null;
            return (
              <Container key={section.id}>
                <div className="relative mx-auto aspect-[16/10] max-w-4xl overflow-hidden rounded-sm border border-border">
                  <Image
                    src={section.imageUrl}
                    alt={section.imageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 896px"
                    unoptimized={section.imageUrl.startsWith("/uploads/")}
                  />
                </div>
                {section.caption ? (
                  <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-muted">{section.caption}</p>
                ) : null}
              </Container>
            );
          case "IMAGE_TEXT":
            if (!section.imageUrl) return null;
            return (
              <Container key={section.id}>
                {section.title ? <SectionHeading title={section.title} className="mb-8" /> : null}
                <SplitMediaLayout
                  image={{
                    src: section.imageUrl,
                    alt: section.imageAlt,
                    aspectClass: "aspect-[4/3]",
                  }}
                  imageSide={section.imageSide ?? "left"}
                >
                  <Prose>
                    {section.paragraphs.filter(Boolean).map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </Prose>
                </SplitMediaLayout>
              </Container>
            );
          case "GALLERY":
            if (section.images.length === 0) return null;
            return (
              <Container key={section.id}>
                {section.title ? <SectionHeading title={section.title} className="mb-8" /> : null}
                <GalleryList
                  items={section.images.map((image, index) => ({
                    id: `${section.id}-${index}`,
                    src: image.url,
                    alt: image.alt,
                    title: image.title,
                    aspectClass: "aspect-square",
                  }))}
                  variant="masonry"
                />
              </Container>
            );
          case "QUOTE":
            if (!section.quote.trim()) return null;
            return (
              <Container key={section.id}>
                <blockquote className="mx-auto max-w-3xl border-l-4 border-primary/40 pl-6">
                  <p className="font-display text-2xl leading-relaxed text-foreground sm:text-3xl">
                    &ldquo;{section.quote}&rdquo;
                  </p>
                  {section.attribution ? (
                    <footer className="mt-4 text-sm text-muted">— {section.attribution}</footer>
                  ) : null}
                </blockquote>
              </Container>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
