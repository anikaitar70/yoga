import { prisma } from "@/lib/prisma";
import { SpecialEventsManager } from "@/components/admin/SpecialEventsManager";
import type { AdminEvent } from "@/lib/admin-types";
import { DEFAULT_EVENT_ORDER } from "@/lib/event-map";
import { parseEventDetail } from "@/lib/event-detail";
import { parseSpecialEventTocOverride } from "@/lib/event-page-section";

async function getSpecialEvents(): Promise<AdminEvent[]> {
  const data = await prisma.event.findMany({
    where: { isSpecialEvent: true },
    orderBy: DEFAULT_EVENT_ORDER,
    include: {
      _count: {
        select: { pageSections: true },
      },
    },
  });

  return data.map((item) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    description: item.description,
    location: item.location,
    startsAt: item.startsAt.toISOString(),
    endsAt: item.endsAt?.toISOString() ?? null,
    imageUrl: item.imageUrl,
    imageAlt: item.imageAlt,
    externalUrl: item.externalUrl,
    externalLinkLabel: item.externalLinkLabel,
    eventDetail: parseEventDetail(item.eventDetail),
    sortOrder: item.sortOrder,
    price: item.price,
    category: item.category,
    isFeatured: item.isFeatured,
    published: item.published,
    seoTitle: item.seoTitle,
    metaDescription: item.metaDescription,
    ogImageUrl: item.ogImageUrl,
    canonicalUrlOverride: item.canonicalUrlOverride,
    focusKeywords: item.focusKeywords,
    jaTranslationStatus: item.jaTranslationStatus,
    isSpecialEvent: item.isSpecialEvent,
    specialEventTocMode: item.specialEventTocMode,
    specialEventTocOverride: parseSpecialEventTocOverride(item.specialEventTocOverride),
    pageSectionCount: item._count.pageSections,
  })) as AdminEvent[];
}

export default async function AdminSpecialEventsPage() {
  const events = await getSpecialEvents();

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Special events</h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage retreat and major event pages with dedicated URLs, section-based content, and table of contents
          controls.
        </p>
      </div>
      <SpecialEventsManager initialEvents={events} />
    </div>
  );
}
