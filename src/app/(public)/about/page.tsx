import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchAboutPage, fetchPageSections, fetchSite } from "@/content";
import { resolvePageDesignSettings } from "@/lib/design-settings";
import { ProgramPageDesignScope } from "@/components/design/ProgramPageDesignScope";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageContent } from "@/components/page/PageContent";
import { AboutPageSectionsEmpty } from "@/components/about/AboutPageSectionsEmpty";
import { PageSectionRenderer } from "@/components/content/sections/PageSectionRenderer";
import { SectionSkeleton } from "@/components/ui/SectionSkeleton";
import { buildStaticPageMetadata } from "@/lib/seo/build-static-metadata";
import { getLocale } from "@/lib/i18n/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, webPageJsonLd } from "@/lib/seo/structured-data";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { uiMessage } from "@/lib/i18n/resolve";
import { getStaticPageDefaults } from "@/lib/seo/page-defaults";

export async function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata("about");
}

async function AboutPageSections() {
  const sections = await fetchPageSections("ABOUT");

  if (sections.length === 0) {
    return <AboutPageSectionsEmpty />;
  }

  return (
    <>
      {sections.map((section, index) => (
        <Suspense
          key={section.id}
          fallback={<SectionSkeleton sectionType={section.sectionType} />}
        >
          <PageSectionRenderer section={section} pageType="ABOUT" sectionIndex={index} />
        </Suspense>
      ))}
    </>
  );
}

export default async function AboutPage() {
  const [page, site, locale] = await Promise.all([
    fetchAboutPage(),
    fetchSite(),
    getLocale(),
  ]);
  const pageDesign = resolvePageDesignSettings(site, "ABOUT");
  const defaults = getStaticPageDefaults("about", locale);
  const homeLabel = uiMessage(locale, "home");

  return (
    <ProgramPageDesignScope settings={pageDesign}>
      <JsonLd
        data={[
          webPageJsonLd({
            name: defaults.title,
            description: defaults.description,
            path: "/about",
            locale,
          }),
          breadcrumbJsonLd(
            [
              { label: homeLabel, href: "/" },
              { label: page.title, href: "/about" },
            ],
            locale,
          ),
        ]}
      />
      <div className="border-b border-border">
        <PageHeader
          eyebrow={page.eyebrow}
          title={page.title}
          subtitle={page.subtitle}
          titleAs="h1"
          breadcrumbs={
            <Breadcrumbs
              className="mb-4"
              items={[
                { label: homeLabel, href: "/" },
                { label: page.title, href: "/about" },
              ]}
            />
          }
        />
        <PageContent>
          <Suspense fallback={null}>
            <AboutPageSections />
          </Suspense>
        </PageContent>
      </div>
    </ProgramPageDesignScope>
  );
}
