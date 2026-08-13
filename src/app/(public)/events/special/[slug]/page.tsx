import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { fetchSpecialEventBySlug } from "@/content/repositories/special-events";
import { fetchSite } from "@/content";
import { getLocale } from "@/lib/i18n/server";
import { buildPageMetadata, mergeSeoDefaults } from "@/lib/seo/metadata";
import { DEFAULT_LOGO_SRC } from "@/lib/site-branding";
import { formatEventRange } from "@/lib/format";
import { Container } from "@/components/ui/Container";
import { PageContent } from "@/components/page/PageContent";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { SpecialEventTableOfContents } from "@/components/content/SpecialEventTableOfContents";
import { SpecialEventSections } from "@/components/content/SpecialEventSections";
import { breadcrumbJsonLd, eventJsonLd, webPageJsonLd } from "@/lib/seo/structured-data";
import { uiMessage } from "@/lib/i18n/resolve";
import { isLocalUploadUrl } from "@/lib/upload-url";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [data, locale, site] = await Promise.all([
    fetchSpecialEventBySlug(slug),
    getLocale(),
    fetchSite(),
  ]);

  if (!data) {
    return { title: "Event", robots: { index: false, follow: false } };
  }

  const { event, publicPath } = data;
  const merged = mergeSeoDefaults(
    { title: event.title, description: event.description },
    event,
  );

  return buildPageMetadata(
    {
      title: merged.title,
      description: merged.description,
      path: publicPath,
      ogImage: merged.ogImage ?? event.ogImageUrl ?? event.imageUrl,
      ogImageAlt: event.imageAlt,
      keywords: merged.keywords ?? event.focusKeywords,
      canonicalOverride: merged.canonicalOverride ?? event.canonicalUrlOverride,
      type: "article",
      publishedTime: event.date,
    },
    locale,
    site.name,
    site.branding.nirvanaYoga.logoSrc || DEFAULT_LOGO_SRC.nirvanaYoga,
  );
}

export default async function SpecialEventPage({ params }: Props) {
  const { slug } = await params;
  const [data, locale] = await Promise.all([fetchSpecialEventBySlug(slug), getLocale()]);
  if (!data) notFound();

  const { event, sections, toc, publicPath } = data;
  const homeLabel = uiMessage(locale, "home");
  const tocTitle = locale === "ja" ? "このページの内容" : "On this page";

  const breadcrumbItems = [
    { label: homeLabel, href: "/" },
    { label: uiMessage(locale, "events"), href: "/events" },
    { label: event.title, href: publicPath },
  ];

  return (
    <article className="border-b border-border">
      <JsonLd
        data={[
          webPageJsonLd({
            name: event.title,
            description: event.description,
            path: publicPath,
            locale,
          }),
          breadcrumbJsonLd(breadcrumbItems, locale),
          eventJsonLd(event, locale),
        ]}
      />

      <Section as="header" variant="muted" spacing="pageHero" border="bottom">
        <Container>
          <Breadcrumbs className="mb-6" items={breadcrumbItems} />
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
            <div>
              <p className="text-sm text-muted">{formatEventRange(event.date, event.endDate, locale)}</p>
              <p className="mt-1 text-sm text-muted">{event.location}</p>
              <h1 className="mt-4 max-w-3xl font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
                {event.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-muted">{event.description}</p>
            </div>
            <SpecialEventTableOfContents items={toc} title={tocTitle} className="lg:sticky lg:top-28" />
          </div>
        </Container>
      </Section>

      {event.imageUrl ? (
        <div className="relative aspect-[21/9] w-full max-h-[min(56vh,520px)] overflow-hidden border-b border-border">
          <Image
            src={event.imageUrl}
            alt={event.imageAlt ?? event.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
            unoptimized={isLocalUploadUrl(event.imageUrl)}
          />
        </div>
      ) : null}

      <PageContent border="bottom">
        <SpecialEventSections sections={sections} />
      </PageContent>
    </article>
  );
}
