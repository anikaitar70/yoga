import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchTestimonials } from "@/content";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageContent } from "@/components/page/PageContent";
import { TestimonialsGridView } from "@/components/content/TestimonialsGridView";
import { ContentSkeleton } from "@/components/ui/ContentSkeleton";
import { buildStaticPageMetadata } from "@/lib/seo/build-static-metadata";
import { getLocale } from "@/lib/i18n/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { webPageJsonLd, breadcrumbJsonLd } from "@/lib/seo/structured-data";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { uiMessage } from "@/lib/i18n/resolve";
import { readTestimonialsPageSettings } from "@/lib/testimonials-page-settings-store";

export async function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata("testimonials");
}

export const dynamic = "force-dynamic";

function contentWidthClass(width?: string) {
  const map: Record<string, string> = {
    narrow: "max-w-3xl",
    normal: "max-w-5xl",
    wide: "max-w-7xl",
  };
  return map[width ?? "normal"] ?? "max-w-5xl";
}

function sectionSpacingClass(spacing?: string) {
  const map: Record<string, string> = {
    none: "py-8 sm:py-10",
    default: "py-12 sm:py-16",
    loose: "py-16 sm:py-20",
    pageHero: "py-16 sm:py-24 lg:py-28",
  };
  return map[spacing ?? "default"] ?? "py-12 sm:py-16";
}

export default async function TestimonialsPage() {
  const [locale, settings] = await Promise.all([getLocale(), readTestimonialsPageSettings()]);
  const homeLabel = uiMessage(locale, "home");
  const isJa = locale === "ja";
  const title = (isJa && settings.headerTitleJa?.trim() ? settings.headerTitleJa : settings.headerTitle?.trim() ? settings.headerTitle : isJa ? "お客様の声" : "Testimonials") as string;
  const subtitle = (isJa && settings.headerSubtitleJa?.trim()
    ? settings.headerSubtitleJa
    : settings.headerSubtitle?.trim()
      ? settings.headerSubtitle
      : isJa
        ? "スタジオに寄せられた心あたたまる声をご紹介します。"
        : "Words from the studio community — shared with permission.") as string;

  const contentSpacing = settings.sectionSpacing ?? "default";
  const widthClass = contentWidthClass(settings.contentWidth);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: title,
            description: subtitle,
            path: "/testimonials",
            locale,
          }),
          breadcrumbJsonLd(
            [
              { label: homeLabel, href: "/" },
              { label: title, href: "/testimonials" },
            ],
            locale,
          ),
        ]}
      />
      {/* Fixed vertical space: previously PageHeader with pageHero (py-16 sm:py-24 lg:py-28) created large blank area before testimonials. Now compact header with py-10 sm:py-14 */}
      <Section variant="immersive" spacing="none" border="subtle" className="border-b border-border/40 py-10 sm:py-14">
        <Container className={widthClass}>
          <Breadcrumbs
            className="mb-4"
            items={[
              { label: homeLabel, href: "/" },
              { label: title, href: "/testimonials" },
            ]}
          />
          <SectionHeading title={title} subtitle={subtitle} size="large" />
        </Container>
      </Section>
      <PageContent>
        <Container className={`${widthClass} ${sectionSpacingClass(contentSpacing)}`}>
          <Suspense fallback={<ContentSkeleton layout="testimonials" count={8} />}>
            <TestimonialsGridView settings={settings} />
          </Suspense>
        </Container>
      </PageContent>
    </>
  );
}
