"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { LocaleEditorTabs, type EditorLocale } from "@/components/admin/LocaleEditorTabs";
import { CustomTextPayloadEditor } from "@/components/admin/CustomTextPayloadEditor";
import { adminDeleteRequest, adminJsonRequest } from "@/lib/admin-fetch";
import type { AdminEventPageSection } from "@/lib/admin-types";
import {
  PAGE_SECTION_TYPE_LABELS,
  PAGE_SECTION_TYPES,
  paragraphsToContent,
  type PageSectionType,
} from "@/lib/page-section-types";
import {
  defaultLayoutForSectionType,
  type SectionLayoutSettings,
} from "@/lib/section-layout";
import { defaultPayloadForSectionType } from "@/lib/page-section-payloads";
import type { LocalePageSectionPatch } from "@/lib/i18n/locale-content";
import { compactEventPageSectionJaLocale } from "@/lib/event-page-section-locale";

type Props = {
  eventId: string;
  initialSections: AdminEventPageSection[];
};

const inputClass =
  "mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

const iconBtnClass =
  "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40";

function mapSection(raw: Record<string, unknown>): AdminEventPageSection {
  return {
    id: String(raw.id),
    eventId: String(raw.eventId),
    sectionType: String(raw.sectionType),
    anchorSlug: String(raw.anchorSlug),
    title: raw.title != null ? String(raw.title) : null,
    subtitle: raw.subtitle != null ? String(raw.subtitle) : null,
    content: raw.content != null ? String(raw.content) : null,
    imageUrl: raw.imageUrl != null ? String(raw.imageUrl) : null,
    imageAlt: raw.imageAlt != null ? String(raw.imageAlt) : null,
    sortOrder: Number(raw.sortOrder),
    isPublished: Boolean(raw.isPublished),
    layout: (raw.layout as SectionLayoutSettings | null) ?? null,
    payload: (raw.payload as Record<string, unknown> | null) ?? null,
    jaLocale: (raw.jaLocale as LocalePageSectionPatch | null) ?? null,
  };
}

const EDITOR_SECTION_TYPES = PAGE_SECTION_TYPES.filter(
  (type) => type !== "EVENTS",
) as PageSectionType[];

export function EventPageSectionsManager({ eventId, initialSections }: Props) {
  const router = useRouter();
  const [sections, setSections] = useState(initialSections);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AdminEventPageSection | null>(null);
  const [contentLocale, setContentLocale] = useState<EditorLocale>("en");
  const [jaDraft, setJaDraft] = useState<LocalePageSectionPatch>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadSections = useCallback(async () => {
    const data = await adminJsonRequest<Record<string, unknown>[]>(
      `/api/events/${eventId}/page-sections`,
      "GET",
    );
    setSections(data.map(mapSection));
  }, [eventId]);

  useEffect(() => {
    if (!draft) {
      setJaDraft({});
      return;
    }
    setJaDraft(draft.jaLocale ?? {});
  }, [draft?.id, draft?.jaLocale]);

  function startEdit(section: AdminEventPageSection) {
    setActiveId(section.id);
    setDraft({
      ...section,
      layout: section.layout ?? defaultLayoutForSectionType(section.sectionType),
      payload:
        section.payload ?? defaultPayloadForSectionType(section.sectionType, "ABOUT") ?? {},
    });
    setMessage(null);
  }

  async function addSection(sectionType: PageSectionType) {
    setBusy(true);
    setMessage(null);
    try {
      const created = await adminJsonRequest<Record<string, unknown>>(
        `/api/events/${eventId}/page-sections`,
        "POST",
        {
          sectionType,
          title: PAGE_SECTION_TYPE_LABELS[sectionType],
          isPublished: false,
          layout: defaultLayoutForSectionType(sectionType),
          payload: defaultPayloadForSectionType(sectionType, "ABOUT") ?? {},
        },
      );
      await loadSections();
      router.refresh();
      startEdit(mapSection(created));
      setMessage("Section added.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to add section.");
    } finally {
      setBusy(false);
    }
  }

  function buildUpdatePayload(section: AdminEventPageSection) {
    const isCustomText = section.sectionType === "CUSTOM_TEXT";
    const customParagraphs = isCustomText
      ? ((section.payload?.paragraphs as string[] | undefined) ?? [])
      : [];
    return {
      title: section.title ?? "",
      subtitle: section.subtitle ?? "",
      content: isCustomText ? paragraphsToContent(customParagraphs) : (section.content ?? ""),
      imageUrl: isCustomText ? null : section.imageUrl?.trim() || null,
      imageAlt: isCustomText ? "" : (section.imageAlt ?? ""),
      isPublished: section.isPublished,
      layout: section.layout ?? defaultLayoutForSectionType(section.sectionType),
      payload: section.payload,
      jaLocale: compactEventPageSectionJaLocale(jaDraft),
    };
  }

  async function saveSection(publish: boolean) {
    if (!draft) return;
    setBusy(true);
    setMessage(null);
    try {
      await adminJsonRequest(`/api/events/${eventId}/page-sections/${draft.id}`, "PUT", {
        ...buildUpdatePayload({ ...draft, isPublished: publish }),
        isPublished: publish,
      });
      await loadSections();
      router.refresh();
      setMessage(publish ? "Section published." : "Section saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save section.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteSection(sectionId: string) {
    if (!window.confirm("Delete this section?")) return;
    setBusy(true);
    try {
      await adminDeleteRequest(`/api/events/${eventId}/page-sections/${sectionId}`);
      if (activeId === sectionId) {
        setActiveId(null);
        setDraft(null);
      }
      await loadSections();
      router.refresh();
      setMessage("Section deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete section.");
    } finally {
      setBusy(false);
    }
  }

  async function moveSection(sectionId: string, direction: "up" | "down") {
    const index = sections.findIndex((section) => section.id === sectionId);
    if (index < 0) return;
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= sections.length) return;
    const orderedIds = sections.map((section) => section.id);
    [orderedIds[index], orderedIds[target]] = [orderedIds[target], orderedIds[index]];
    setBusy(true);
    try {
      const data = await adminJsonRequest<Record<string, unknown>[]>(
        `/api/events/${eventId}/page-sections/reorder`,
        "PATCH",
        { orderedIds },
      );
      setSections(data.map(mapSection));
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to reorder sections.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {EDITOR_SECTION_TYPES.map((sectionType) => (
          <button
            key={sectionType}
            type="button"
            disabled={busy}
            onClick={() => void addSection(sectionType)}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            + {PAGE_SECTION_TYPE_LABELS[sectionType]}
          </button>
        ))}
      </div>

      {message ? <p className="text-sm text-slate-600">{message}</p> : null}

      <div className="space-y-3">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3"
          >
            <div>
              <p className="font-medium text-slate-900">
                {section.title || PAGE_SECTION_TYPE_LABELS[section.sectionType as PageSectionType]}
              </p>
              <p className="text-xs text-slate-500">
                {section.sectionType} · #{section.anchorSlug} ·{" "}
                {section.isPublished ? "Published" : "Draft"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={iconBtnClass} disabled={busy || index === 0} onClick={() => void moveSection(section.id, "up")}>
                ↑
              </button>
              <button
                type="button"
                className={iconBtnClass}
                disabled={busy || index === sections.length - 1}
                onClick={() => void moveSection(section.id, "down")}
              >
                ↓
              </button>
              <button type="button" className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm" onClick={() => startEdit(section)}>
                Edit
              </button>
              <button type="button" className="rounded-xl border border-red-200 px-3 py-1.5 text-sm text-red-700" onClick={() => void deleteSection(section.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {draft ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-slate-900">Edit section</h3>
            <LocaleEditorTabs activeLocale={contentLocale} onChange={setContentLocale} />
          </div>

          {contentLocale === "en" ? (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Title
                <input
                  className={inputClass}
                  value={draft.title ?? ""}
                  onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Subtitle
                <input
                  className={inputClass}
                  value={draft.subtitle ?? ""}
                  onChange={(event) => setDraft({ ...draft, subtitle: event.target.value })}
                />
              </label>
              {draft.sectionType === "CUSTOM_TEXT" ? (
                <CustomTextPayloadEditor
                  pageType="ABOUT"
                  payload={(draft.payload as never) ?? { paragraphs: [] }}
                  onChange={(payload) => setDraft({ ...draft, payload })}
                />
              ) : (
                <label className="block text-sm font-medium text-slate-700">
                  Content
                  <textarea
                    className={`${inputClass} min-h-32`}
                    value={draft.content ?? ""}
                    onChange={(event) => setDraft({ ...draft, content: event.target.value })}
                  />
                </label>
              )}
              {draft.sectionType !== "CUSTOM_TEXT" ? (
                <ImageUploadField
                  label="Section image"
                  section="events"
                  value={draft.imageUrl ?? ""}
                  onChange={(imageUrl) => setDraft({ ...draft, imageUrl })}
                />
              ) : null}
            </div>
          ) : (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Japanese title
                <input
                  className={inputClass}
                  value={jaDraft.title ?? ""}
                  onChange={(event) => setJaDraft({ ...jaDraft, title: event.target.value })}
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Japanese subtitle
                <input
                  className={inputClass}
                  value={jaDraft.subtitle ?? ""}
                  onChange={(event) => setJaDraft({ ...jaDraft, subtitle: event.target.value })}
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Japanese content
                <textarea
                  className={`${inputClass} min-h-32`}
                  value={jaDraft.content ?? ""}
                  onChange={(event) => setJaDraft({ ...jaDraft, content: event.target.value })}
                />
              </label>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" disabled={busy} className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white" onClick={() => void saveSection(false)}>
              Save draft
            </button>
            <button type="button" disabled={busy} className="rounded-full bg-emerald-700 px-5 py-2 text-sm font-medium text-white" onClick={() => void saveSection(true)}>
              Publish section
            </button>
            <button type="button" className="rounded-full border border-slate-300 px-5 py-2 text-sm" onClick={() => setDraft(null)}>
              Close
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
