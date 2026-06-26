import Image from "next/image";
import type { PageSectionRecord } from "@/lib/page-section-types";
import type { PageType } from "@/lib/page-section-types";
import {
  contentToParagraphs,
  type ContactSectionPayload,
  type CustomTextSectionPayload,
  type EventsSectionPayload,
  type GallerySectionPayload,
  type TestimonialsSectionPayload,
} from "@/lib/page-section-types";
import { paragraphsFromPayload, resolveExperienceTimelineItems, resolveTimelineStyleForSection, sutraEnabled } from "@/lib/custom-text-payload";
import { resolveImageAspectClass, resolveImageSide } from "@/lib/section-layout";
import { LayoutAwareSectionContainer } from "@/components/content/sections/LayoutAwareSectionContainer";
import { LayoutAwareGalleryFrame } from "@/components/content/sections/LayoutAwareGalleryFrame";
import { LayoutAwareProse } from "@/components/content/sections/LayoutAwareProse";
import { fetchEventsForSection } from "@/content/repositories/events";
import { fetchSite } from "@/content/repositories/site";
import {
  resolveSectionGalleryImages,
  resolveSectionTestimonials,
} from "@/lib/program-section-resolvers";
import { getProgramTheme } from "@/lib/program-page-themes";
import { resolveSectionTitleBrand } from "@/lib/section-title-brand";
import { SectionBrandTitle } from "@/components/ui/SectionBrandTitle";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Prose } from "@/components/ui/Prose";
import { SplitMediaLayout } from "@/components/content/SplitMediaLayout";
import { GalleryList } from "@/components/content/GalleryList";
import { GalleryCarousel } from "@/components/content/sections/GalleryCarousel";
import { TestimonialCarousel } from "@/components/testimonials/TestimonialCarousel";
import { EventList } from "@/components/content/EventList";
import { ProgramContactSection } from "@/components/content/sections/ProgramContactSection";
import { ProgramHeroBlock } from "@/components/program/ProgramHeroBlock";
import { ProgramSectionShell } from "@/components/program/ProgramSectionShell";
import { ProgramParagraphGrid } from "@/components/program/ProgramParagraphGrid";
import { ArtJourneySection } from "@/components/program/ArtJourneySection";
import { HealingJourneySection } from "@/components/program/HealingJourneySection";
import { YogaJourneySection } from "@/components/program/YogaJourneySection";
import { AboutSectionShell } from "@/components/about/AboutSectionShell";
import { ExperienceTimeline, type ExperienceTimelineItem } from "@/components/about/ExperienceTimeline";
import { YogaSutraPassage } from "@/components/content/YogaSutraPassage";
import { cn } from "@/lib/utils";

type BlockProps = {
  section: PageSectionRecord;
  pageType: PageType;
  sectionIndex?: number;
};

function experienceTimelineItemsFromPayload(
  payload: CustomTextSectionPayload | null,
): ExperienceTimelineItem[] {
  return resolveExperienceTimelineItems(payload).map((item) => ({
    year: item.number.trim(),
    title: item.title?.trim() ?? "",
    body: item.text.trim(),
  }));
}

export async function HeroSectionBlock({ section, sectionIndex = 0 }: BlockProps) {
  return <ProgramHeroBlock section={section} sectionIndex={sectionIndex} />;
}

export async function ImageTextSectionBlock({ section, pageType, sectionIndex = 0 }: BlockProps) {
  const pageDefaultSide = pageType === "JUST_ART_LIFE" ? "right" : "left";
  const imageSide = resolveImageSide(section.layout, "IMAGE_TEXT", pageDefaultSide);
  const paragraphs = contentToParagraphs(section.content);
  const aspectClass = resolveImageAspectClass(section.layout, "IMAGE_TEXT");
  const image = section.imageUrl
    ? {
        src: section.imageUrl,
        alt: section.imageAlt || section.title || "Section image",
        aspectClass,
      }
    : null;
  const titleBrand = resolveSectionTitleBrand(section, pageType);
  const headingAlign = section.layout?.textAlignment === "center" ? "center" : "left";

  if (pageType === "ABOUT") {
    return (
      <ProgramSectionShell layout={section.layout} sectionType="IMAGE_TEXT" sectionIndex={sectionIndex}>
      <LayoutAwareSectionContainer layout={section.layout}>
        <SectionBrandTitle
          titleBrand={titleBrand}
          title={section.title}
          subtitle={section.subtitle}
          align={headingAlign}
        />
        {image ? (
          <SplitMediaLayout image={image} imageSide={imageSide} layout={section.layout} align="start">
            <LayoutAwareProse layout={section.layout}>
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </LayoutAwareProse>
          </SplitMediaLayout>
        ) : (
          <LayoutAwareProse layout={section.layout}>
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </LayoutAwareProse>
        )}
      </LayoutAwareSectionContainer>
    </ProgramSectionShell>
  );
}

  return (
    <ProgramSectionShell
      layout={section.layout}
      sectionType="IMAGE_TEXT"
      sectionIndex={sectionIndex}
      className={
        pageType === "HEALING"
          ? "bg-primary-soft/15"
          : pageType === "YOGA"
            ? "bg-accent-soft/20"
            : undefined
      }
    >
      <LayoutAwareSectionContainer layout={section.layout}>
        <SectionBrandTitle
          titleBrand={titleBrand}
          title={section.title}
          subtitle={section.subtitle}
          align={headingAlign}
        />
        {image ? (
          <SplitMediaLayout image={image} imageSide={imageSide} layout={section.layout}>
            <LayoutAwareProse layout={section.layout} className="text-base sm:text-lg">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </LayoutAwareProse>
          </SplitMediaLayout>
        ) : (
          <LayoutAwareProse layout={section.layout} className="text-base sm:text-lg">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </LayoutAwareProse>
        )}
      </LayoutAwareSectionContainer>
    </ProgramSectionShell>
  );
}

export async function GallerySectionBlock({ section, pageType, sectionIndex = 0 }: BlockProps) {
  const payload = (section.payload as GallerySectionPayload | null) ?? { images: [] };
  const images = await resolveSectionGalleryImages(payload, pageType);
  const theme = getProgramTheme(pageType);

  const galleryVariant =
    section.layout?.galleryStyle === "immersive"
      ? "immersive"
      : section.layout?.galleryStyle === "masonry"
        ? "masonry"
        : section.layout?.galleryStyle === "grid"
          ? "default"
          : theme.galleryVariant;

  const items = images.map((img, index) => ({
    id: `${section.id}-${index}`,
    src: img.url,
    alt: img.alt,
    title: img.title,
    aspectClass: "aspect-square" as const,
  }));

  return (
    <ProgramSectionShell
      layout={section.layout}
      sectionType="GALLERY"
      sectionIndex={sectionIndex}
      className={pageType === "JUST_ART_LIFE" ? "bg-surface-warm/30" : undefined}
    >
      <LayoutAwareSectionContainer layout={section.layout}>
        {section.title ? (
          <SectionHeading
            title={section.title}
            subtitle={section.subtitle || undefined}
            className="mb-10"
            align={section.layout?.textAlignment === "center" ? "center" : "left"}
            size={pageType === "JUST_ART_LIFE" ? "large" : "default"}
          />
        ) : null}
        {payload.carousel ? (
          <GalleryCarousel images={images} />
        ) : (
          <LayoutAwareGalleryFrame layout={section.layout} sectionType="GALLERY">
            <GalleryList items={items} variant={galleryVariant} />
          </LayoutAwareGalleryFrame>
        )}
      </LayoutAwareSectionContainer>
    </ProgramSectionShell>
  );
}

export async function TestimonialsSectionBlock({ section, pageType, sectionIndex = 0 }: BlockProps) {
  const payload = (section.payload as TestimonialsSectionPayload | null) ?? { items: [] };
  const items = await resolveSectionTestimonials(payload);

  return (
    <ProgramSectionShell
      layout={section.layout}
      sectionType="TESTIMONIALS"
      sectionIndex={sectionIndex}
      className={pageType === "HEALING" ? "bg-gradient-to-b from-primary-soft/20 to-background" : "bg-accent-soft/15"}
    >
      <LayoutAwareSectionContainer layout={section.layout}>
        {section.title ? (
          <SectionHeading
            title={section.title}
            subtitle={section.subtitle || undefined}
            align={section.layout?.textAlignment === "center" ? "center" : "left"}
            className="mb-12"
          />
        ) : null}
        <TestimonialCarousel
          testimonials={items}
          variant="featured"
          quoteClassName={getProgramTheme(pageType).quoteClass}
        />
      </LayoutAwareSectionContainer>
    </ProgramSectionShell>
  );
}

export async function EventsSectionBlock({ section, pageType, sectionIndex = 0 }: BlockProps) {
  const payload = (section.payload as EventsSectionPayload | null) ?? { eventKind: "all" };
  const events = await fetchEventsForSection(payload);

  return (
    <ProgramSectionShell layout={section.layout} sectionType="EVENTS" sectionIndex={sectionIndex}>
      <LayoutAwareSectionContainer layout={section.layout}>
        {section.title ? (
          <SectionHeading
            title={section.title}
            subtitle={section.subtitle || undefined}
            align={section.layout?.textAlignment === "center" ? "center" : "left"}
            className="mb-10"
          />
        ) : null}
        {section.content ? (
          <LayoutAwareProse layout={section.layout} className="mb-10">
            {contentToParagraphs(section.content).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </LayoutAwareProse>
        ) : null}
        <EventList events={events} />
        {events.length > 0 ? (
          <div className="mt-10 text-center">
            <a
              href="/events"
              className="text-sm font-medium text-primary-muted underline-offset-4 hover:text-primary hover:underline"
            >
              View full calendar →
            </a>
          </div>
        ) : null}
      </LayoutAwareSectionContainer>
    </ProgramSectionShell>
  );
}

export async function ContactSectionBlock({ section, sectionIndex = 0 }: BlockProps) {
  const [payload, site] = await Promise.all([
    Promise.resolve((section.payload as ContactSectionPayload | null) ?? { showForm: true }),
    fetchSite(),
  ]);

  return (
    <ProgramContactSection
      title={section.title || "Get in touch"}
      subtitle={section.subtitle || undefined}
      content={section.content}
      payload={payload}
      layout={section.layout}
      sectionIndex={sectionIndex}
      contact={site.contact}
      social={site.social}
    />
  );
}

export async function CustomTextSectionBlock({ section, pageType, sectionIndex = 0 }: BlockProps) {
  const payload = section.payload as CustomTextSectionPayload | null;
  const paragraphs = paragraphsFromPayload(payload, section.content);
  const site = await fetchSite();
  const timelineStyle = resolveTimelineStyleForSection(pageType, payload, {
    timelineStyleDefaults: site.timelineStyleDefaults,
    timelineStyleByPage: site.timelineStyleByPage,
  });
  const isYogaJourney = pageType === "YOGA" && payload?.variant === "yoga-journey";
  const isHealingJourney = pageType === "HEALING" && payload?.variant === "healing-journey";
  const isArtJourney = pageType === "JUST_ART_LIFE" && payload?.variant === "art-journey";
  const isExperienceTimeline = pageType === "ABOUT" && payload?.variant === "experience-timeline";
  const isPhilosophy = pageType === "ABOUT" && payload?.variant === "philosophy";

  if (pageType === "ABOUT") {
    if (isExperienceTimeline) {
      return (
        <AboutSectionShell sectionIndex={sectionIndex} variant="experience-timeline">
          <LayoutAwareSectionContainer layout={section.layout} sectionType="CUSTOM_TEXT">
            <ExperienceTimeline
              title={section.title}
              items={experienceTimelineItemsFromPayload(payload)}
              timelineStyle={timelineStyle}
            />
          </LayoutAwareSectionContainer>
        </AboutSectionShell>
      );
    }

    if (isPhilosophy) {
      const sutras = payload?.sutras ?? [];
      return (
        <AboutSectionShell sectionIndex={sectionIndex} variant="philosophy">
          {section.title ? (
            <h2 className="font-display text-3xl font-medium tracking-[var(--tracking-display)] text-foreground">
              {section.title}
            </h2>
          ) : null}
          <div className={section.title ? "mt-10 space-y-10" : "space-y-10"}>
            {sutras.map((sutra, index) => (
              <YogaSutraPassage
                key={sutra.source || index}
                sutra={{
                  sanskrit: sutra.sanskrit ?? "",
                  transliteration: sutra.transliteration ?? "",
                  translation: sutra.translation ?? "",
                  source: sutra.source ?? "",
                  interpretation: sutra.interpretation ?? "",
                }}
                delay={index * 100}
              />
            ))}
          </div>
        </AboutSectionShell>
      );
    }

    return (
      <AboutSectionShell sectionIndex={sectionIndex}>
        {section.title ? (
          <SectionHeading
            title={section.title}
            subtitle={section.subtitle || undefined}
            align={section.layout?.textAlignment === "center" ? "center" : "left"}
            className="mb-10"
          />
        ) : null}
        <div className="space-y-4">
          <Prose>
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </Prose>
        </div>
      </AboutSectionShell>
    );
  }

  return (
    <ProgramSectionShell
      layout={section.layout}
      sectionType="CUSTOM_TEXT"
      sectionIndex={sectionIndex}
      className={
        isYogaJourney
          ? "program-yoga-journey-shell"
          : isHealingJourney
            ? "program-healing-journey-shell"
            : isArtJourney
              ? "program-art-journey-shell"
              : undefined
      }
    >
      <LayoutAwareSectionContainer layout={section.layout}>
        {isYogaJourney ? (
          <YogaJourneySection
            title={section.title}
            subtitle={section.subtitle}
            paragraphs={paragraphs}
            sutra={
              sutraEnabled(payload) && payload?.sutra
                ? {
                    ...payload.sutra,
                    interpretation: payload.sutra.interpretation ?? "",
                  }
                : undefined
            }
            introParagraphCount={payload?.introParagraphCount}
            closingParagraphCount={payload?.closingParagraphCount}
          />
        ) : isHealingJourney ? (
          <HealingJourneySection
            title={section.title}
            subtitle={section.subtitle}
            paragraphs={paragraphs}
            payload={payload}
            highlights={payload?.highlights}
            introParagraphCount={payload?.introParagraphCount}
            closingParagraphCount={payload?.closingParagraphCount}
          />
        ) : isArtJourney ? (
          <ArtJourneySection
            title={section.title}
            subtitle={section.subtitle}
            paragraphs={paragraphs}
            payload={payload}
            highlights={payload?.highlights}
            introParagraphCount={payload?.introParagraphCount}
            closingParagraphCount={payload?.closingParagraphCount}
            timelineStyle={timelineStyle}
            titleBrand="justArtAffaire"
          />
        ) : (
          <>
            {section.title ? (
              <SectionHeading
                title={section.title}
                subtitle={section.subtitle || undefined}
                align={section.layout?.textAlignment === "center" ? "center" : "left"}
                className="mb-10"
              />
            ) : null}
            <ProgramParagraphGrid paragraphs={paragraphs} title={section.title || undefined} />
          </>
        )}
      </LayoutAwareSectionContainer>
    </ProgramSectionShell>
  );
}
