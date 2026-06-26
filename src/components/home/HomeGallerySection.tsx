import Link from "next/link";
import type { GalleryItem } from "@/content/types";
import type { HomepageGalleryChrome } from "@/lib/homepage-sections";
import { DEFAULT_HOMEPAGE_SECTIONS } from "@/lib/homepage-sections";
import { GalleryList } from "@/components/content/GalleryList";
import { SectionLayoutShell } from "@/components/content/sections/SectionLayoutShell";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { SectionLayoutSettings } from "@/lib/section-layout";

type HomeGallerySectionProps = {
  items: GalleryItem[];
  chrome?: HomepageGalleryChrome;
  layout?: SectionLayoutSettings | null;
  className?: string;
  showDraftBanner?: boolean;
};

/** Homepage gallery teaser — accepts items directly for admin preview. */
export function HomeGallerySection({
  items,
  chrome = DEFAULT_HOMEPAGE_SECTIONS.gallery,
  layout,
  className,
  showDraftBanner,
}: HomeGallerySectionProps) {
  const cta = chrome.primaryCta;

  if (items.length === 0) {
    return (
      <SectionLayoutShell sectionType="GALLERY" border="subtle" layout={layout} className={className}>
        <Container>
          <SectionHeading eyebrow={chrome.eyebrow} title={chrome.title} />
          <p className="mt-6 text-center text-sm text-muted">
            {chrome.emptyMessage ?? DEFAULT_HOMEPAGE_SECTIONS.gallery.emptyMessage}
          </p>
        </Container>
      </SectionLayoutShell>
    );
  }

  return (
    <SectionLayoutShell sectionType="GALLERY" border="subtle" layout={layout} className={className}>
      {showDraftBanner ? (
        <div className="bg-amber-100 px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-amber-900">
          Includes unpublished gallery items — not on live site
        </div>
      ) : null}
      <Container>
        <ScrollReveal animation="rise">
          <SectionHeading
            eyebrow={chrome.eyebrow}
            title={chrome.title}
            subtitle={chrome.subtitle}
          />
        </ScrollReveal>
        <ScrollReveal animation="fade" delay={200}>
          <GalleryList items={items} className="mt-12" variant="immersive" />
        </ScrollReveal>
        {cta?.href && cta?.label ? (
          <p className="mt-8 text-center">
            <Link
              href={cta.href}
              className="text-sm font-medium text-primary-muted underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              {cta.label}
            </Link>
          </p>
        ) : null}
      </Container>
    </SectionLayoutShell>
  );
}
