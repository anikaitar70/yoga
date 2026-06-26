"use client";

import type { PageSectionRecord, PageType } from "@/lib/page-section-types";
import {
  contentToParagraphs,
  type ContactSectionPayload,
  type CustomTextSectionPayload,
  type EventsSectionPayload,
  type GallerySectionPayload,
  type TestimonialsSectionPayload,
} from "@/lib/page-section-types";
import {
  paragraphsFromPayload,
  resolveExperienceTimelineItems,
} from "@/lib/custom-text-payload";
import { resolveImageAspectClass, resolveImageSide } from "@/lib/section-layout";
import type { TimelineStyleSettings } from "@/lib/timeline-style";
import { LayoutAwareSectionContainer } from "@/components/content/sections/LayoutAwareSectionContainer";
import { LayoutAwareProse } from "@/components/content/sections/LayoutAwareProse";
import { LayoutAwareSectionHeading } from "@/components/content/sections/LayoutAwareSectionHeading";
import { LayoutAwareGalleryFrame } from "@/components/content/sections/LayoutAwareGalleryFrame";
import { getProgramTheme } from "@/lib/program-page-themes";
import { AboutSectionShell } from "@/components/about/AboutSectionShell";
import { SplitMediaLayout } from "@/components/content/SplitMediaLayout";
import { GalleryList } from "@/components/content/GalleryList";
import { GalleryCarousel } from "@/components/content/sections/GalleryCarousel";
import { TestimonialCarousel } from "@/components/testimonials/TestimonialCarousel";
import { EventListView } from "@/components/content/EventListView";
import { ProgramContactSection } from "@/components/content/sections/ProgramContactSection";
import { ProgramHeroBlock } from "@/components/program/ProgramHeroBlock";
import { ProgramSectionShell } from "@/components/program/ProgramSectionShell";
import { ProgramParagraphGrid } from "@/components/program/ProgramParagraphGrid";
import { ArtJourneySection } from "@/components/program/ArtJourneySection";
import { HealingJourneySection } from "@/components/program/HealingJourneySection";
import { YogaJourneySection } from "@/components/program/YogaJourneySection";
import { ExperienceTimeline } from "@/components/about/ExperienceTimeline";
import { YogaSutraPassage } from "@/components/content/YogaSutraPassage";
import { sutraEnabled } from "@/lib/custom-text-payload";
import type { Testimonial, SiteContact, SocialLink, Event } from "@/content/types";

export type ClientSectionPreviewData = {
  galleryImages?: Array<{ url: string; alt: string; title?: string }>;
  testimonials?: Testimonial[];
  events?: Event[];
  timelineStyle?: TimelineStyleSettings | null;
  contact?: SiteContact;
  social?: SocialLink[];
};

type ClientSectionPreviewProps = {
  section: PageSectionRecord;
  pageType: PageType;
  sectionIndex?: number;
  data: ClientSectionPreviewData;
};

function experienceTimelineItemsFromPayload(payload: CustomTextSectionPayload | null) {
  return resolveExperienceTimelineItems(payload).map((item) => ({
    year: item.number.trim(),
    title: item.title?.trim() ?? "",
    body: item.text.trim(),
  }));
}

export function ClientSectionPreview({
  section,
  pageType,
  sectionIndex = 0,
  data,
}: ClientSectionPreviewProps) {
  switch (section.sectionType) {
    case "HERO":
      return <ProgramHeroBlock section={section} sectionIndex={sectionIndex} />;
    case "IMAGE_TEXT":
      return <ImageTextPreview section={section} pageType={pageType} sectionIndex={sectionIndex} />;
    case "GALLERY":
      return <GalleryPreview section={section} pageType={pageType} sectionIndex={sectionIndex} data={data} />;
    case "TESTIMONIALS":
      return (
        <TestimonialsPreview section={section} pageType={pageType} sectionIndex={sectionIndex} data={data} />
      );
    case "EVENTS":
      return <EventsPreview section={section} pageType={pageType} sectionIndex={sectionIndex} data={data} />;
    case "CONTACT":
      return (
        <ContactPreview section={section} pageType={pageType} sectionIndex={sectionIndex} data={data} />
      );
    case "CUSTOM_TEXT":
      return (
        <CustomTextPreview
          section={section}
          pageType={pageType}
          sectionIndex={sectionIndex}
          data={data}
        />
      );
    default:
      return null;
  }
}

function ImageTextPreview({
  section,
  pageType,
  sectionIndex,
}: {
  section: PageSectionRecord;
  pageType: PageType;
  sectionIndex: number;
}) {
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

  return (
    <ProgramSectionShell layout={section.layout} sectionType="IMAGE_TEXT" sectionIndex={sectionIndex}>
      <LayoutAwareSectionContainer layout={section.layout} sectionType="IMAGE_TEXT">
        {section.title || section.subtitle ? (
          <LayoutAwareSectionHeading
            title={section.title || ""}
            subtitle={section.subtitle || undefined}
            layout={section.layout}
            className="mb-10"
          />
        ) : null}
        {image ? (
          <SplitMediaLayout image={image} imageSide={imageSide} layout={section.layout} align={pageType === "ABOUT" ? "start" : "center"}>
            <LayoutAwareProse layout={section.layout} sectionType="IMAGE_TEXT" className={pageType === "ABOUT" ? undefined : "text-base sm:text-lg"}>
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </LayoutAwareProse>
          </SplitMediaLayout>
        ) : (
          <LayoutAwareProse layout={section.layout} sectionType="IMAGE_TEXT" className={pageType === "ABOUT" ? undefined : "text-base sm:text-lg"}>
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </LayoutAwareProse>
        )}
      </LayoutAwareSectionContainer>
    </ProgramSectionShell>
  );
}

function GalleryPreview({
  section,
  pageType,
  sectionIndex,
  data,
}: {
  section: PageSectionRecord;
  pageType: PageType;
  sectionIndex: number;
  data: ClientSectionPreviewData;
}) {
  const payload = (section.payload as GallerySectionPayload | null) ?? { images: [] };
  const images = data.galleryImages ?? [];
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
    <ProgramSectionShell layout={section.layout} sectionType="GALLERY" sectionIndex={sectionIndex}>
      <LayoutAwareSectionContainer layout={section.layout} sectionType="GALLERY">
        {section.title ? (
          <LayoutAwareSectionHeading
            title={section.title}
            subtitle={section.subtitle || undefined}
            layout={section.layout}
            className="mb-10"
            size={pageType === "JUST_ART_LIFE" ? "large" : "default"}
          />
        ) : null}
        <LayoutAwareGalleryFrame layout={section.layout} sectionType="GALLERY">
          {payload.carousel ? <GalleryCarousel images={images} /> : <GalleryList items={items} variant={galleryVariant} />}
        </LayoutAwareGalleryFrame>
      </LayoutAwareSectionContainer>
    </ProgramSectionShell>
  );
}

function TestimonialsPreview({
  section,
  pageType,
  sectionIndex,
  data,
}: {
  section: PageSectionRecord;
  pageType: PageType;
  sectionIndex: number;
  data: ClientSectionPreviewData;
}) {
  const items = data.testimonials ?? [];

  return (
    <ProgramSectionShell layout={section.layout} sectionType="TESTIMONIALS" sectionIndex={sectionIndex}>
      <LayoutAwareSectionContainer layout={section.layout} sectionType="TESTIMONIALS">
        {section.title ? (
          <LayoutAwareSectionHeading
            title={section.title}
            subtitle={section.subtitle || undefined}
            layout={section.layout}
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

function EventsPreview({
  section,
  pageType,
  sectionIndex,
  data,
}: {
  section: PageSectionRecord;
  pageType: PageType;
  sectionIndex: number;
  data: ClientSectionPreviewData;
}) {
  const events = data.events ?? [];

  return (
    <ProgramSectionShell layout={section.layout} sectionType="EVENTS" sectionIndex={sectionIndex}>
      <LayoutAwareSectionContainer layout={section.layout} sectionType="EVENTS">
        {section.title ? (
          <LayoutAwareSectionHeading
            title={section.title}
            subtitle={section.subtitle || undefined}
            layout={section.layout}
            className="mb-10"
          />
        ) : null}
        {section.content ? (
          <LayoutAwareProse layout={section.layout} sectionType="EVENTS" className="mb-10">
            {contentToParagraphs(section.content).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </LayoutAwareProse>
        ) : null}
        <EventListView events={events} locale="en" />
      </LayoutAwareSectionContainer>
    </ProgramSectionShell>
  );
}

function ContactPreview({
  section,
  sectionIndex,
  data,
}: {
  section: PageSectionRecord;
  pageType: PageType;
  sectionIndex: number;
  data: ClientSectionPreviewData;
}) {
  const payload = (section.payload as ContactSectionPayload | null) ?? { showForm: true };
  if (!data.contact) return null;

  return (
    <ProgramContactSection
      title={section.title || "Get in touch"}
      subtitle={section.subtitle || undefined}
      content={section.content}
      payload={payload}
      layout={section.layout}
      sectionIndex={sectionIndex}
      contact={data.contact}
      social={data.social}
    />
  );
}

function CustomTextPreview({
  section,
  pageType,
  sectionIndex,
  data,
}: {
  section: PageSectionRecord;
  pageType: PageType;
  sectionIndex: number;
  data: ClientSectionPreviewData;
}) {
  const payload = section.payload as CustomTextSectionPayload | null;
  const paragraphs = paragraphsFromPayload(payload, section.content);
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
              timelineStyle={data.timelineStyle}
              staticReveal
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
          <LayoutAwareSectionHeading
            title={section.title}
            subtitle={section.subtitle || undefined}
            layout={section.layout}
            className="mb-10"
          />
        ) : null}
        <div className="space-y-4">
          <LayoutAwareProse layout={section.layout} sectionType="CUSTOM_TEXT">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </LayoutAwareProse>
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
      <LayoutAwareSectionContainer layout={section.layout} sectionType="CUSTOM_TEXT">
        {isYogaJourney ? (
          <YogaJourneySection
            title={section.title}
            subtitle={section.subtitle}
            paragraphs={paragraphs}
            sutra={
              sutraEnabled(payload) && payload?.sutra
                ? { ...payload.sutra, interpretation: payload.sutra.interpretation ?? "" }
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
            timelineStyle={data.timelineStyle}
            titleBrand="justArtAffaire"
          />
        ) : (
          <>
            {section.title ? (
              <LayoutAwareSectionHeading
                title={section.title}
                subtitle={section.subtitle || undefined}
                layout={section.layout}
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
