import { fetchAllPageSections } from "@/content/repositories/page-sections";
import PageSectionsManager from "@/components/admin/PageSectionsManager";
import type { AdminPageSection } from "@/lib/admin-types";
import type { PageType } from "@/lib/page-section-types";
import { PAGE_TYPES } from "@/lib/page-section-types";

function toAdminSection(record: Awaited<ReturnType<typeof fetchAllPageSections>>[number]): AdminPageSection {
  return {
    id: record.id,
    pageType: record.pageType,
    sectionType: record.sectionType,
    title: record.title,
    subtitle: record.subtitle,
    content: record.content,
    imageUrl: record.imageUrl,
    imageAlt: record.imageAlt,
    sortOrder: record.sortOrder,
    isPublished: record.isPublished,
    layout: record.layout,
    payload: (record.payload as Record<string, unknown> | null) ?? null,
  };
}

export default async function AdminPagesPage() {
  const initialByPage = {} as Record<PageType, AdminPageSection[]>;

  for (const pageType of PAGE_TYPES) {
    const sections = await fetchAllPageSections(pageType);
    initialByPage[pageType] = sections.map(toAdminSection);
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Page sections</h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage Yoga, Healing, Just Art Affaire, and About page sections. Program pages show an empty-state
          placeholder when no sections are published; the About page hero is edited separately under Content →
          About page hero.
        </p>
      </div>
      <PageSectionsManager initialByPage={initialByPage} />
    </div>
  );
}
