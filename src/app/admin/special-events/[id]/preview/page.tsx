import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { SpecialEventSections } from "@/components/content/SpecialEventSections";
import { SpecialEventTableOfContents } from "@/components/content/SpecialEventTableOfContents";
import { PageContent } from "@/components/page/PageContent";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { RichText } from "@/components/content/RichText";
import { TextContainer } from "@/components/content/TextContainer";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { formatEventRange } from "@/lib/format";
import { buildSpecialEventToc, parseSpecialEventTocOverride, specialEventPublicPath } from "@/lib/event-page-section";
import { mapEventPageSection } from "@/lib/event-page-section";
import { localizedPath } from "@/lib/i18n/paths";
import { isExternalEventCtaUrl } from "@/lib/event-cta-url";
import { isLocalUploadUrl } from "@/lib/upload-url";
import Image from "next/image";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function SpecialEventAdminPreview({ params }: Props) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: { pageSections: { orderBy: { sortOrder: "asc" } } },
  });
  if (!event) notFound();

  // Admin preview shows ALL sections (including drafts) so unsaved CMS work is visible in studio
  const sections = event.pageSections.map((s) => mapEventPageSection(s));
  const tocOverride = parseSpecialEventTocOverride(event.specialEventTocOverride);
  const toc = buildSpecialEventToc(sections, (event.specialEventTocMode as "AUTOMATIC" | "CUSTOM") ?? "AUTOMATIC", tocOverride);
  const tocDesign = tocOverride?.design ?? null;
  const publicPath = specialEventPublicPath(event.slug);

  const ctaUrl = event.specialEventCtaUrl?.trim();
  const ctaLabel = event.specialEventCtaLabel?.trim();
  const showCta = Boolean(ctaUrl && ctaLabel);
  const ctaHref = ctaUrl?.startsWith("/") ? localizedPath(ctaUrl, "en") : ctaUrl;

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Events", href: "/events" },
    { label: event.title, href: publicPath },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <p className="font-semibold">Admin Preview — Special Event (includes drafts)</p>
        <p className="mt-1 text-xs">This preview shows unpublished sections for QA. Public page hides drafts.</p>
        <div className="mt-2 flex flex-wrap gap-3">
          <Link href={`/admin/special-events/${event.id}`} className="underline">← Back to editor</Link>
          <Link href={publicPath} target="_blank" className="underline">View live public page ↗</Link>
        </div>
      </div>

      <article className="overflow-hidden rounded-3xl border border-border bg-card">
        <Section as="header" variant="muted" spacing="pageHero" border="bottom">
          <Container>
            <Breadcrumbs className="mb-6" items={breadcrumbItems} />
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
              <div>
                <p className="text-sm text-muted">{formatEventRange(event.startsAt.toISOString(), event.endsAt?.toISOString() ?? undefined, "en")}</p>
                <p className="mt-1 text-sm text-muted">{event.location}</p>
                <h1 className="mt-4 max-w-3xl font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">{event.title}</h1>
                <div className="mt-6 max-w-2xl text-lg text-muted">
                  <TextContainer settings={{ mode: "none" }}>
                    <RichText html={event.description ?? ""} />
                  </TextContainer>
                </div>
                {showCta && ctaHref ? (
                  <Button href={ctaHref} variant="primary" className="mt-8 min-h-11" external={isExternalEventCtaUrl(ctaHref)}>{ctaLabel}</Button>
                ) : null}
              </div>
              <SpecialEventTableOfContents items={toc} title="On this page" design={tocDesign} className="lg:sticky lg:top-28" />
            </div>
          </Container>
        </Section>

        {event.imageUrl ? (
          <div className="relative aspect-[21/9] w-full max-h-[min(56vh,520px)] overflow-hidden border-b border-border">
            <Image src={event.imageUrl} alt={event.imageAlt ?? event.title} fill className="object-cover" sizes="100vw" unoptimized={isLocalUploadUrl(event.imageUrl)} />
          </div>
        ) : null}

        <PageContent border="bottom">
          <SpecialEventSections sections={sections as never} />
        </PageContent>
      </article>
    </div>
  );
}
