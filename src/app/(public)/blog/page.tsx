import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchPageIntro } from "@/content";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageContent } from "@/components/page/PageContent";
import { BlogSection } from "@/components/content/BlogSection";
import { ContentSkeleton } from "@/components/ui/ContentSkeleton";
import { buildStaticPageMetadata } from "@/lib/seo/build-static-metadata";
import { getLocale } from "@/lib/i18n/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { blogListJsonLd, breadcrumbJsonLd, webPageJsonLd } from "@/lib/seo/structured-data";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { uiMessage } from "@/lib/i18n/resolve";
import { getStaticPageDefaults } from "@/lib/seo/page-defaults";

export async function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata("blog");
}

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const [intro, locale] = await Promise.all([fetchPageIntro("blog"), getLocale()]);
  const defaults = getStaticPageDefaults("blog", locale);
  const homeLabel = uiMessage(locale, "home");

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: defaults.title,
            description: defaults.description,
            path: "/blog",
            locale,
          }),
          blogListJsonLd(locale),
          breadcrumbJsonLd(
            [
              { label: homeLabel, href: "/" },
              { label: intro.title, href: "/blog" },
            ],
            locale,
          ),
        ]}
      />
      <PageHeader
        {...intro}
        titleAs="h1"
        breadcrumbs={
          <Breadcrumbs
            className="mb-4"
            items={[
              { label: homeLabel, href: "/" },
              { label: intro.title, href: "/blog" },
            ]}
          />
        }
      />
      <PageContent>
        <Suspense fallback={<ContentSkeleton layout="blog" count={3} />}>
          <BlogSection />
        </Suspense>
      </PageContent>
    </>
  );
}
