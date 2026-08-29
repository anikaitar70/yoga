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
import { RichText } from "@/components/content/RichText";
import { TextContainer } from "@/components/content/TextContainer";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { SpecialEventTableOfContents } from "@/components/content/SpecialEventTableOfContents";
import { SpecialEventSections } from "@/components/content/SpecialEventSections";
import { fetchSpecialEventTestimonialsFallback } from "@/lib/testimonial-selections";
import { TestimonialCard } from "@/components/testimonials/TestimonialCard";
import { breadcrumbJsonLd, eventJsonLd, webPageJsonLd } from "@/lib/seo/structured-data";
import { uiMessage } from "@/lib/i18n/resolve";
import { Button } from "@/components/ui/Button";
import { localizedPath } from "@/lib/i18n/paths";
import { isExternalEventCtaUrl } from "@/lib/event-cta-url";
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

  const { event, sections, toc, tocDesign, publicPath } = data;
  const homeLabel = uiMessage(locale, "home");
  const tocTitle = locale === "ja" ? "このページの内容" : "On this page";
  const ctaUrl = event.specialEventCtaUrl?.trim();
  const ctaLabel = event.specialEventCtaLabel?.trim();
  const showCta = Boolean(ctaUrl && ctaLabel);
  const ctaHref = ctaUrl?.startsWith("/") ? localizedPath(ctaUrl, locale) : ctaUrl;

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
              <div className="mt-6 max-w-2xl text-lg text-muted">
                <TextContainer settings={{ mode: "none" }}>
                  <RichText html={event.description} />
                </TextContainer>
              </div>
              {showCta && ctaHref ? (
                <Button
                  href={ctaHref}
                  variant="primary"
                  className="mt-8 min-h-11"
                  external={isExternalEventCtaUrl(ctaHref)}
                >
                  {ctaLabel}
                </Button>
              ) : null}
            </div>
            <SpecialEventTableOfContents items={toc} title={tocTitle} design={tocDesign} className="lg:sticky lg:top-28" />
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

      {/* Special-event testimonials — selected per event */}
      <SpecialEventTestimonialsSection eventId={event.id} />
    </article>
  );
}

async function SpecialEventTestimonialsSection({ eventId }: { eventId: string }) {
  const testimonials = await fetchSpecialEventTestimonialsFallback(eventId);
  if (testimonials.length === 0) return null;
  return (
    <Section variant="muted" border="bottom">
      <Container>
        <h2 className="font-display text-3xl font-medium text-foreground">Testimonials</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {testimonials.map((t) => (
            <TestimonialCard key={(t as { id: string }).id} testimonial={t as never} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
