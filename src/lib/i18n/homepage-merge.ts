import type { HomepageSectionsContent } from "@/lib/homepage-sections";
import type { LocaleHomepageSectionsPatch } from "@/lib/i18n/locale-content";
import type { Locale } from "@/lib/i18n/locale";
import type { PhilosophyContent } from "@/content/types";
import { localizeHref } from "@/lib/i18n/paths";

/** Shared homepage JA merge used by public resolve and CMS JA editor. */
export function mergeHomepagePatchForLocale(
  sections: HomepageSectionsContent,
  patch: LocaleHomepageSectionsPatch | undefined,
  locale: Locale,
): HomepageSectionsContent {
  if (!patch) return sections;

  const next = {
    ...sections,
    ...patch,
    aboutPreview: {
      ...sections.aboutPreview,
      ...patch.aboutPreview,
      highlights: (patch.aboutPreview?.highlights ?? sections.aboutPreview.highlights) as string[],
      linkHref: localizeHref(patch.aboutPreview?.linkHref ?? sections.aboutPreview.linkHref, locale),
    },
    philosophy: {
      ...sections.philosophy,
      ...patch.philosophy,
      sutras: (patch.philosophy?.sutras ?? sections.philosophy.sutras) as PhilosophyContent["sutras"],
      paragraphs: (patch.philosophy?.paragraphs ?? sections.philosophy.paragraphs) as string[],
    },
    newsletter: { ...sections.newsletter, ...patch.newsletter },
    pathways: (patch.pathways ?? sections.pathways).map((pathway, index) => {
      const base = sections.pathways[index] ?? pathway!;
      const merged = { ...base, ...pathway };
      return {
        ...merged,
        highlights: (merged.highlights ?? base.highlights) as string[],
        href: localizeHref(merged.href ?? base.href, locale),
      };
    }),
    featuredEvents: {
      ...sections.featuredEvents,
      ...patch.featuredEvents,
      ctaHref: patch.featuredEvents?.ctaHref
        ? localizeHref(patch.featuredEvents.ctaHref, locale)
        : sections.featuredEvents.ctaHref
          ? localizeHref(sections.featuredEvents.ctaHref, locale)
          : undefined,
    },
    retreats: {
      ...sections.retreats,
      ...patch.retreats,
      primaryCta: patch.retreats?.primaryCta?.label
        ? {
            label: patch.retreats.primaryCta.label,
            href: localizeHref(patch.retreats.primaryCta.href ?? sections.retreats.primaryCta?.href ?? "#", locale),
          }
        : sections.retreats.primaryCta
          ? { ...sections.retreats.primaryCta, href: localizeHref(sections.retreats.primaryCta.href, locale) }
          : undefined,
    },
    gallery: {
      ...sections.gallery,
      ...patch.gallery,
      primaryCta: patch.gallery?.primaryCta?.label
        ? {
            label: patch.gallery.primaryCta.label,
            href: localizeHref(patch.gallery.primaryCta.href ?? sections.gallery.primaryCta?.href ?? "/gallery", locale),
          }
        : sections.gallery.primaryCta
          ? { ...sections.gallery.primaryCta, href: localizeHref(sections.gallery.primaryCta.href, locale) }
          : undefined,
    },
    testimonials: { ...sections.testimonials, ...patch.testimonials },
    contactPreview: {
      ...sections.contactPreview,
      ...patch.contactPreview,
      primaryCta: patch.contactPreview?.primaryCta?.label
        ? {
            label: patch.contactPreview.primaryCta.label,
            href: localizeHref(
              patch.contactPreview.primaryCta.href ?? sections.contactPreview.primaryCta?.href ?? "/contact",
              locale,
            ),
          }
        : sections.contactPreview.primaryCta
          ? {
              ...sections.contactPreview.primaryCta,
              href: localizeHref(sections.contactPreview.primaryCta.href, locale),
            }
          : undefined,
      secondaryCta: patch.contactPreview?.secondaryCta?.label
        ? {
            label: patch.contactPreview.secondaryCta.label,
            href: localizeHref(
              patch.contactPreview.secondaryCta.href ?? sections.contactPreview.secondaryCta?.href ?? "/events",
              locale,
            ),
          }
        : sections.contactPreview.secondaryCta
          ? {
              ...sections.contactPreview.secondaryCta,
              href: localizeHref(sections.contactPreview.secondaryCta.href, locale),
            }
          : undefined,
    },
    schedule: { ...sections.schedule, ...patch.schedule },
    weeklySessions:
      patch.weeklySessions?.map((session, index) => ({
        ...(sections.weeklySessions[index] ?? session!),
        ...session,
      })) ?? sections.weeklySessions,
    upcomingPrograms: (patch.upcomingPrograms ?? sections.upcomingPrograms).map((program, index) => {
      const base = sections.upcomingPrograms[index] ?? program;
      if (!base) return sections.upcomingPrograms[index]!;
      return {
        ...base,
        ...(program ?? {}),
        href: localizeHref(program?.href ?? base.href, locale),
      };
    }),
  } as HomepageSectionsContent;

  return next;
}
