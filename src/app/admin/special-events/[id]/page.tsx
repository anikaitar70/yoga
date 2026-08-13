import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SpecialEventEditor } from "@/components/admin/SpecialEventEditor";
import type { AdminEvent, AdminEventPageSection } from "@/lib/admin-types";
import { parseEventDetail } from "@/lib/event-detail";
import { mapEventPageSection, parseSpecialEventTocOverride } from "@/lib/event-page-section";
import { parseEventPageSectionJaLocale } from "@/lib/event-page-section-locale";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminSpecialEventEditPage({ params }: Props) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      pageSections: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!event) notFound();

  const adminEvent: AdminEvent = {
    id: event.id,
    title: event.title,
    slug: event.slug,
    description: event.description,
    location: event.location,
    startsAt: event.startsAt.toISOString(),
    endsAt: event.endsAt?.toISOString() ?? null,
    imageUrl: event.imageUrl,
    imageAlt: event.imageAlt,
    externalUrl: event.externalUrl,
    externalLinkLabel: event.externalLinkLabel,
    eventDetail: parseEventDetail(event.eventDetail),
    sortOrder: event.sortOrder,
    price: event.price,
    category: event.category,
    isFeatured: event.isFeatured,
    published: event.published,
    seoTitle: event.seoTitle,
    metaDescription: event.metaDescription,
    ogImageUrl: event.ogImageUrl,
    canonicalUrlOverride: event.canonicalUrlOverride,
    focusKeywords: event.focusKeywords,
    jaTranslationStatus: event.jaTranslationStatus,
    isSpecialEvent: event.isSpecialEvent,
    specialEventTocMode: event.specialEventTocMode,
    specialEventTocOverride: parseSpecialEventTocOverride(event.specialEventTocOverride),
    pageSectionCount: event.pageSections.length,
  };

  const sections: AdminEventPageSection[] = event.pageSections.map((section) => {
    const mapped = mapEventPageSection(section);
    return {
      ...mapped,
      jaLocale: parseEventPageSectionJaLocale(section.jaLocale),
    };
  });

  return <SpecialEventEditor event={adminEvent} sections={sections} />;
}
