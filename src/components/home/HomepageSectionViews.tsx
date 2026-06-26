import { SplitMediaLayout } from "@/components/content/SplitMediaLayout";
import { EventList } from "@/components/content/EventList";
import { YogaSutraPassage } from "@/components/content/YogaSutraPassage";
import { TestimonialCarousel } from "@/components/testimonials/TestimonialCarousel";
import { NewsletterForm } from "@/components/layout/NewsletterForm";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionLayoutShell } from "@/components/content/sections/SectionLayoutShell";
import { HomeGallerySection } from "@/components/home/HomeGallerySection";
import { ProgramPathwaySection, type ProgramPathway } from "@/components/home/ProgramPathwaySection";
import type { Event, GalleryItem, Testimonial, SiteContact, SocialLink } from "@/content/types";
import type {
  HomepageAboutPreview,
  HomepageFeaturedEventsChrome,
  HomepageGalleryChrome,
  HomepagePhilosophy,
  HomepageSectionChrome,
} from "@/lib/homepage-sections";
import { sectionTitleClassName } from "@/lib/constants";
import { StudioContactLinks } from "@/components/content/StudioContactLinks";
import { SocialLinks } from "@/components/content/SocialLinks";
import { cn } from "@/lib/utils";

export function AboutPreviewSectionView({
  about,
  layout,
}: {
  about: HomepageAboutPreview;
  layout?: import("@/lib/section-layout").SectionLayoutSettings | null;
}) {
  return (
    <SectionLayoutShell sectionType="IMAGE_TEXT" border="subtle" layout={layout}>
      <Container>
        <ScrollReveal animation="rise">
          <SplitMediaLayout
            image={{
              src: about.imageSrc,
              alt: about.imageAlt,
            }}
            imageSide={about.imageSide ?? "left"}
            layout={layout}
          >
            <div>
              {about.eyebrow ? <Eyebrow>{about.eyebrow}</Eyebrow> : null}
              <h2 className={cn(sectionTitleClassName, "mt-4")}>{about.heading}</h2>
              <p className="mt-6 text-base leading-[var(--leading-calm)] text-muted sm:text-lg">
                {about.body}
              </p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {about.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/90">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Button href={about.linkHref} variant="secondary">
                  {about.linkLabel}
                </Button>
              </div>
            </div>
          </SplitMediaLayout>
        </ScrollReveal>
      </Container>
    </SectionLayoutShell>
  );
}

export function PhilosophySectionView({
  philosophy,
  layout,
}: {
  philosophy: HomepagePhilosophy;
  layout?: import("@/lib/section-layout").SectionLayoutSettings | null;
}) {
  const sutras = philosophy.sutras ?? [];

  return (
    <SectionLayoutShell sectionType="CUSTOM_TEXT" border="subtle" variant="warm" layout={layout}>
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <ScrollReveal animation="rise">
            {philosophy.eyebrow ? (
              <p className="text-[0.7rem] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-primary-muted">
                {philosophy.eyebrow}
              </p>
            ) : null}
            <h2 className={cn(sectionTitleClassName, "mt-4")}>{philosophy.heading}</h2>
          </ScrollReveal>
        </div>

        <div className="mx-auto mt-14 max-w-3xl space-y-10">
          {sutras.map((sutra, index) => (
            <YogaSutraPassage key={sutra.source} sutra={sutra} delay={index * 120} />
          ))}
        </div>

        {philosophy.closing ? (
          <ScrollReveal animation="fade" delay={200}>
            <p className="mx-auto mt-14 max-w-2xl text-center text-base leading-[var(--leading-calm)] text-muted sm:text-lg">
              {philosophy.closing}
            </p>
          </ScrollReveal>
        ) : null}
      </Container>
    </SectionLayoutShell>
  );
}

export function PathwayPreviewSection({
  pathway,
  layout,
}: {
  pathway: ProgramPathway;
  layout?: import("@/lib/section-layout").SectionLayoutSettings | null;
}) {
  return <ProgramPathwaySection pathway={pathway} layout={layout} />;
}

export function FeaturedEventsSectionView({
  events,
  chrome,
  layout,
}: {
  events: Event[];
  chrome: HomepageFeaturedEventsChrome;
  layout?: import("@/lib/section-layout").SectionLayoutSettings | null;
}) {
  if (events.length === 0) return null;

  return (
    <SectionLayoutShell sectionType="EVENTS" border="subtle" layout={layout}>
      <Container>
        <ScrollReveal animation="rise">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading eyebrow={chrome.eyebrow} title={chrome.titleFeatured} subtitle={chrome.subtitle} />
            {chrome.ctaHref && chrome.ctaLabel ? (
              <Button href={chrome.ctaHref} variant="ghost" className="hidden sm:inline-flex">
                {chrome.ctaLabel}
              </Button>
            ) : null}
          </div>
        </ScrollReveal>
        <ScrollReveal animation="fade" delay={200}>
          <div className="mt-14">
            <EventList events={events} />
          </div>
        </ScrollReveal>
        {chrome.ctaHref && chrome.ctaLabelMobile ? (
          <div className="mt-10 sm:hidden">
            <Button href={chrome.ctaHref} variant="secondary" className="w-full">
              {chrome.ctaLabelMobile}
            </Button>
          </div>
        ) : null}
      </Container>
    </SectionLayoutShell>
  );
}

export function RetreatsPreviewSectionView({
  events,
  chrome,
  layout,
}: {
  events: Event[];
  chrome: HomepageSectionChrome;
  layout?: import("@/lib/section-layout").SectionLayoutSettings | null;
}) {
  if (events.length === 0) return null;

  const cta = chrome.primaryCta;

  return (
    <SectionLayoutShell sectionType="EVENTS" border="subtle" variant="immersive" layout={layout}>
      <Container>
        <ScrollReveal animation="rise">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow={chrome.eyebrow}
              title={chrome.title}
              subtitle={chrome.subtitle}
              size="large"
            />
            {cta?.href && cta?.label ? (
              <Button href={cta.href} variant="secondary" className="hidden sm:inline-flex">
                {cta.label}
              </Button>
            ) : null}
          </div>
        </ScrollReveal>
        <ScrollReveal animation="fade" delay={200}>
          <div className="mt-14">
            <EventList events={events} />
          </div>
        </ScrollReveal>
        {cta?.href && cta?.label ? (
          <div className="mt-10 sm:hidden">
            <Button href={cta.href} variant="secondary" className="w-full">
              {cta.label}
            </Button>
          </div>
        ) : null}
      </Container>
    </SectionLayoutShell>
  );
}

export function GalleryPreviewSection({
  items,
  chrome,
  layout,
}: {
  items: GalleryItem[];
  chrome: HomepageGalleryChrome;
  layout?: import("@/lib/section-layout").SectionLayoutSettings | null;
}) {
  return <HomeGallerySection items={items} chrome={chrome} layout={layout} />;
}

export function TestimonialsSectionView({
  items,
  chrome,
  layout,
}: {
  items: Testimonial[];
  chrome: HomepageSectionChrome;
  layout?: import("@/lib/section-layout").SectionLayoutSettings | null;
}) {
  return (
    <SectionLayoutShell sectionType="TESTIMONIALS" border="subtle" variant="immersive" layout={layout}>
      <Container>
        <ScrollReveal animation="rise">
          <SectionHeading
            eyebrow={chrome.eyebrow}
            title={chrome.title}
            subtitle={chrome.subtitle}
            align="center"
            className="mx-auto"
            size="large"
          />
        </ScrollReveal>
        <div className="mt-16">
          <TestimonialCarousel testimonials={items} variant="featured" animated={false} />
        </div>
      </Container>
    </SectionLayoutShell>
  );
}

export function NewsletterSectionView({
  title,
  subtitle,
  layout,
}: {
  title: string;
  subtitle: string;
  layout?: import("@/lib/section-layout").SectionLayoutSettings | null;
}) {
  return (
    <SectionLayoutShell sectionType="CUSTOM_TEXT" border="subtle" variant="card" layout={layout}>
      <Container>
        <ScrollReveal animation="rise">
          <div className="mx-auto max-w-xl rounded-2xl border border-border/50 bg-card-elevated p-10 text-center sm:p-12">
            <h2 className={sectionTitleClassName}>{title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">{subtitle}</p>
            <NewsletterForm id="home-newsletter-preview" className="mt-8 text-left" />
          </div>
        </ScrollReveal>
      </Container>
    </SectionLayoutShell>
  );
}

export function ContactPreviewSectionView({
  site,
  social,
  chrome,
  layout,
}: {
  site: SiteContact;
  social: SocialLink[];
  chrome: HomepageSectionChrome;
  layout?: import("@/lib/section-layout").SectionLayoutSettings | null;
}) {
  return (
    <SectionLayoutShell sectionType="CONTACT" border="none" variant="warm" layout={layout}>
      <Container>
        <ScrollReveal animation="rise">
          <div className="mx-auto max-w-2xl rounded-2xl border border-border/60 bg-card/80 p-10 text-center shadow-[0_8px_40px_rgba(42,36,31,0.06)] sm:p-14">
            <SectionHeading
              eyebrow={chrome.eyebrow}
              title={chrome.title}
              subtitle={chrome.subtitle}
              align="center"
              className="mx-auto"
            />
            <div className="mt-8">
              <StudioContactLinks contact={site} centered labeled linkClassName="hover:text-foreground" />
            </div>
            {social.length > 0 ? (
              <div className="mt-8">
                <SocialLinks links={social} layout="prominent" centered />
              </div>
            ) : null}
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {chrome.primaryCta ? (
                <Button href={chrome.primaryCta.href} variant="warm">
                  {chrome.primaryCta.label}
                </Button>
              ) : null}
              {chrome.secondaryCta ? (
                <Button href={chrome.secondaryCta.href} variant="secondary">
                  {chrome.secondaryCta.label}
                </Button>
              ) : null}
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </SectionLayoutShell>
  );
}
