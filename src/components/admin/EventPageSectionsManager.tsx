"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { LocaleEditorTabs, type EditorLocale } from "@/components/admin/LocaleEditorTabs";
import { CustomTextPayloadEditor } from "@/components/admin/CustomTextPayloadEditor";
import { FontSizeControl } from "@/components/admin/FontSizeControl";
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
  layoutPatchWithImageAspect,
  SECTION_ALIGN_LABELS,
  SECTION_ALIGN_OPTIONS,
  SECTION_GALLERY_STYLE_LABELS,
  SECTION_GALLERY_STYLE_OPTIONS,
  SECTION_IMAGE_ASPECT_LABELS,
  SECTION_IMAGE_ASPECT_OPTIONS,
  SECTION_IMAGE_SIDE_LABELS,
  SECTION_IMAGE_SIDE_OPTIONS,
  SECTION_SPACING_LABELS,
  SECTION_SPACING_OPTIONS,
  SECTION_WIDTH_LABELS,
  SECTION_WIDTH_OPTIONS,
  type SectionLayoutSettings,
  type TextContainerSettings,
} from "@/lib/section-layout";
import { defaultPayloadForSectionType } from "@/lib/page-section-payloads";
import type { LocalePageSectionPatch } from "@/lib/i18n/locale-content";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { compactEventPageSectionJaLocale } from "@/lib/event-page-section-locale";
import { translateHtmlViaApi, translateTextViaApi } from "@/lib/auto-translate";

type Props = {
  eventId: string;
  initialSections: AdminEventPageSection[];
};

const inputClass =
  "mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

const iconBtnClass =
  "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40";

const SECTION_TEXT_STYLE_TOGGLES = [
  { key: "bold", label: "B — Bold" },
  { key: "italic", label: "I — Italic" },
  { key: "underline", label: "U — Underline" },
] as const;

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
  (type) => type !== "EVENTS" && type !== "DYNAMIC_IMAGE_TEXT",
) as PageSectionType[];

export function EventPageSectionsManager({ eventId, initialSections }: Props) {
  const router = useRouter();
  const [sections, setSections] = useState(initialSections);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AdminEventPageSection | null>(null);
  const [contentLocale, setContentLocale] = useState<EditorLocale>("en");
  const [jaDraft, setJaDraft] = useState<LocalePageSectionPatch>({});
  const [busy, setBusy] = useState(false);
  const [translateBusy, setTranslateBusy] = useState(false);
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
    let payload: Record<string, unknown> | null = (section.payload as Record<string, unknown> | null) ?? (defaultPayloadForSectionType(section.sectionType, "ABOUT") as Record<string, unknown> | null) ?? {};
    // Unify IMAGE_TEXT legacy -> unified items
    if (section.sectionType === "IMAGE_TEXT" || section.sectionType === "DYNAMIC_IMAGE_TEXT") {
      const items = Array.isArray((payload as { items?: unknown })?.items) ? (payload as { items: unknown[] }).items : [];
      if (items.length === 0 && (section.content?.trim() || section.imageUrl?.trim())) {
        payload = {
          scrollBehavior: (payload as { scrollBehavior?: string })?.scrollBehavior ?? "sticky",
          layoutDirection: (payload as { layoutDirection?: string })?.layoutDirection ?? "image-left",
          imageHeight: (payload as { imageHeight?: string })?.imageHeight ?? "medium",
          imageFit: (payload as { imageFit?: string })?.imageFit ?? "cover",
          items: [
            {
              id: `item-${section.id.slice(0, 8)}`,
              imageUrl: section.imageUrl ?? "",
              imageAlt: section.imageAlt ?? "",
              content: section.content ?? "<p></p>",
            },
          ],
        };
      }
      if (!Array.isArray((payload as { items?: unknown }).items)) (payload as { items: unknown[] }).items = [];
    }
    setDraft({
      ...section,
      layout: section.layout ?? defaultLayoutForSectionType(section.sectionType),
      payload,
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
    const isUnified = section.sectionType === "IMAGE_TEXT" || section.sectionType === "DYNAMIC_IMAGE_TEXT";
    const customParagraphs = isCustomText
      ? ((section.payload?.paragraphs as string[] | undefined) ?? [])
      : [];
    let payload: Record<string, unknown> | null = (section.payload as Record<string, unknown> | null) ?? null;
    if (isUnified && payload) {
      const rawItems = Array.isArray(payload.items) ? (payload.items as Record<string, unknown>[]) : [];
      const items = rawItems
        .map((it) => ({
          id: typeof it.id === "string" && it.id.trim() ? it.id : `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          imageUrl: typeof it.imageUrl === "string" ? String(it.imageUrl).trim() : "",
          imageAlt: typeof it.imageAlt === "string" ? it.imageAlt.trim() : undefined,
          content: typeof it.content === "string" ? String(it.content) : "",
          contentJa: typeof it.contentJa === "string" && it.contentJa.trim() ? String(it.contentJa) : undefined,
        }))
        .filter((it) => Boolean(it.imageUrl || it.content.trim()));
      payload = {
        scrollBehavior: (payload.scrollBehavior as string) ?? "sticky",
        layoutDirection: (payload.layoutDirection as string) ?? "image-left",
        imageHeight: (payload.imageHeight as string) ?? "medium",
        imageFit: (payload.imageFit as string) ?? "cover",
        items,
      };
    }
    return {
      title: section.title ?? "",
      subtitle: section.subtitle ?? "",
      content: isCustomText ? paragraphsToContent(customParagraphs) : isUnified ? "" : (section.content ?? ""),
      imageUrl: isCustomText || isUnified ? null : section.imageUrl?.trim() || null,
      imageAlt: isCustomText || isUnified ? "" : (section.imageAlt ?? ""),
      isPublished: section.isPublished,
      layout: section.layout ?? defaultLayoutForSectionType(section.sectionType),
      payload,
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

          {draft.sectionType === "IMAGE_TEXT" || draft.sectionType === "DYNAMIC_IMAGE_TEXT" ? (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Title{contentLocale === "ja" ? " (日本語)" : ""}
                <input
                  className={inputClass}
                  value={contentLocale === "en" ? (draft.title ?? "") : (jaDraft.title ?? "")}
                  onChange={(event) =>
                    contentLocale === "en"
                      ? setDraft({ ...draft, title: event.target.value })
                      : setJaDraft({ ...jaDraft, title: event.target.value })
                  }
                  placeholder={contentLocale === "ja" ? draft.title ?? "" : undefined}
                />
              </label>
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={translateBusy || !draft.title?.trim()}
                  className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-900 hover:bg-sky-100 disabled:opacity-50"
                  onClick={async () => {
                    if (!draft.title?.trim()) return;
                    setTranslateBusy(true);
                    try {
                      const ja = await translateTextViaApi(draft.title);
                      setJaDraft((prev) => ({ ...prev, title: ja }));
                    } catch (e) {
                      setMessage(e instanceof Error ? e.message : "Translation failed");
                    } finally {
                      setTranslateBusy(false);
                    }
                  }}
                >
                  {translateBusy ? "Translating..." : "Translate title to Japanese"}
                </button>
              </div>
              <label className="block text-sm font-medium text-slate-700">
                Subtitle{contentLocale === "ja" ? " (日本語)" : ""}
                <input
                  className={inputClass}
                  value={contentLocale === "en" ? (draft.subtitle ?? "") : (jaDraft.subtitle ?? "")}
                  onChange={(event) =>
                    contentLocale === "en"
                      ? setDraft({ ...draft, subtitle: event.target.value })
                      : setJaDraft({ ...jaDraft, subtitle: event.target.value })
                  }
                  placeholder={contentLocale === "ja" ? draft.subtitle ?? "" : undefined}
                />
              </label>
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={translateBusy || !draft.subtitle?.trim()}
                  className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-900 hover:bg-sky-100 disabled:opacity-50"
                  onClick={async () => {
                    if (!draft.subtitle?.trim()) return;
                    setTranslateBusy(true);
                    try {
                      const ja = await translateTextViaApi(draft.subtitle);
                      setJaDraft((prev) => ({ ...prev, subtitle: ja }));
                    } catch (e) {
                      setMessage(e instanceof Error ? e.message : "Translation failed");
                    } finally {
                      setTranslateBusy(false);
                    }
                  }}
                >
                  {translateBusy ? "Translating..." : "Translate subtitle to Japanese"}
                </button>
              </div>
              <p className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
                Image + Text uses the items editor below. Each item has its own image and rich text.
              </p>
              <DynamicEventPayloadEditor draft={draft} onChange={setDraft} />
            </div>
          ) : draft.sectionType === "BUTTON" ? (
            <EventButtonPayloadEditor draft={draft} onChange={setDraft} />
          ) : contentLocale === "en" ? (
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
                <RichTextEditor
                  label="Content"
                  value={draft.content ?? ""}
                  onChange={(html) => setDraft({ ...draft, content: html })}
                  placeholder="Section content"
                  minHeight={140}
                />
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
              <RichTextEditor
                label="Japanese content"
                value={jaDraft.content ?? ""}
                onChange={(html) => setJaDraft({ ...jaDraft, content: html })}
                placeholder="日本語コンテンツ"
                minHeight={140}
              />
            </div>
          )}

          <LayoutEditor draft={draft} onChange={setDraft} />

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" disabled={busy} className="cursor-pointer rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50" onClick={() => void saveSection(false)}>
              Save draft
            </button>
            <button type="button" disabled={busy} className="cursor-pointer rounded-full bg-emerald-700 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50" onClick={() => void saveSection(true)}>
              Publish section
            </button>
            <button type="button" className="cursor-pointer rounded-full border border-slate-300 px-5 py-2 text-sm hover:bg-slate-50" onClick={() => setDraft(null)}>
              Close
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function DynamicEventPayloadEditor({
  draft,
  onChange,
}: {
  draft: AdminEventPageSection;
  onChange: React.Dispatch<React.SetStateAction<AdminEventPageSection | null>>;
}) {
  const payload = (draft.payload as Record<string, unknown> | null) ?? {};
  const items = Array.isArray(payload.items) ? (payload.items as { id: string; imageUrl: string; imageAlt?: string; content: string; contentJa?: string }[]) : [];
  const scrollBehavior = (payload.scrollBehavior as string) ?? "sticky";
  const layoutDirection = (payload.layoutDirection as string) ?? "image-left";
  const imageHeight = (payload.imageHeight as string) ?? "medium";
  const imageFit = (payload.imageFit as string) ?? "cover";

  function updateItem(index: number, patch: Record<string, unknown>) {
    onChange((prev) => {
      if (!prev) return prev;
      const cur = (prev.payload as Record<string, unknown> | null) ?? {};
      const curItems = Array.isArray(cur.items) ? [...(cur.items as Record<string, unknown>[])] : [];
      curItems[index] = { ...(curItems[index] as Record<string, unknown>), ...patch };
      return { ...prev, payload: { ...cur, items: curItems } };
    });
  }
  function moveItem(index: number, dir: "up" | "down") {
    const target = dir === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= items.length) return;
    onChange((prev) => {
      if (!prev) return prev;
      const cur = (prev.payload as Record<string, unknown> | null) ?? {};
      const curItems = Array.isArray(cur.items) ? [...(cur.items as Record<string, unknown>[])] : [];
      const copy = [...curItems];
      const [moved] = copy.splice(index, 1);
      copy.splice(target, 0, moved);
      return { ...prev, payload: { ...cur, items: copy } };
    });
  }
  function updatePayload(patch: Record<string, unknown>) {
    onChange((prev) => {
      if (!prev) return prev;
      return { ...prev, payload: { ...(prev.payload as Record<string, unknown> | null ?? {}), ...patch } };
    });
  }

  return (
    <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 p-4">
      <div>
        <p className="text-sm font-semibold text-slate-800">Image + Text items</p>
        <p className="mt-1 text-xs text-slate-500">Multiple image/text items with optional sticky-image scrolling.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Scroll behavior
          <select className={inputClass} value={scrollBehavior} onChange={(e) => updatePayload({ scrollBehavior: e.target.value })}>
            <option value="sticky">Sticky image</option>
            <option value="normal">Normal</option>
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Layout direction
          <select className={inputClass} value={layoutDirection} onChange={(e) => updatePayload({ layoutDirection: e.target.value })}>
            <option value="image-left">Image left / Text right</option>
            <option value="image-right">Image right / Text left</option>
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Image height
          <select className={inputClass} value={imageHeight} onChange={(e) => updatePayload({ imageHeight: e.target.value })}>
            <option value="auto">Auto</option>
            <option value="small">Small (240px)</option>
            <option value="medium">Medium (360px)</option>
            <option value="large">Large (500px)</option>
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Image fit
          <select className={inputClass} value={imageFit} onChange={(e) => updatePayload({ imageFit: e.target.value })}>
            <option value="cover">Cover</option>
            <option value="contain">Contain</option>
          </select>
        </label>
      </div>
      <div className="space-y-4">
        <p className="text-sm font-semibold text-slate-700">Items ({items.length})</p>
        {items.map((item, index) => (
          <div key={item.id ?? index} className="space-y-3 rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Item {index + 1}</p>
              <div className="flex gap-2">
                <button type="button" disabled={index === 0} onClick={() => moveItem(index, "up")} className={iconBtnClass} title="Move up">↑</button>
                <button type="button" disabled={index === items.length - 1} onClick={() => moveItem(index, "down")} className={iconBtnClass} title="Move down">↓</button>
                <button
                  type="button"
                  className="text-xs text-red-600"
                  onClick={() =>
                    onChange((prev) => {
                      if (!prev) return prev;
                      const cur = (prev.payload as Record<string, unknown> | null) ?? {};
                      const curItems = Array.isArray(cur.items) ? [...(cur.items as Record<string, unknown>[])] : [];
                      return { ...prev, payload: { ...cur, items: curItems.filter((_, i) => i !== index) } };
                    })
                  }
                >
                  Remove
                </button>
              </div>
            </div>
            <ImageUploadField label={`Image ${index + 1}`} section="events" value={item.imageUrl ?? ""} onChange={(url) => updateItem(index, { imageUrl: url })} />
            <input placeholder="Image alt text" value={item.imageAlt ?? ""} className={inputClass} onChange={(e) => updateItem(index, { imageAlt: e.target.value })} />
            <RichTextEditor label={`Text — English (Item ${index + 1})`} value={item.content ?? ""} onChange={(html) => updateItem(index, { content: html })} placeholder="English rich text…" minHeight={120} />
            <div className="flex justify-end">
              <button
                type="button"
                className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-900 hover:bg-sky-100"
                onClick={async () => {
                  try {
                    const ja = await translateHtmlViaApi(item.content ?? "");
                    updateItem(index, { contentJa: ja });
                  } catch (e) {
                    alert(e instanceof Error ? e.message : "Translation failed. Check GEMINI_API_KEY.");
                  }
                }}
              >
                Translate / Regenerate Japanese
              </button>
            </div>
            <RichTextEditor label={`Text — Japanese (Item ${index + 1}) — auto, editable`} value={item.contentJa ?? ""} onChange={(html) => updateItem(index, { contentJa: html })} placeholder="日本語リッチテキスト…（自動生成後に編集可）" minHeight={120} />
            <p className="text-[11px] text-slate-500">MACHINE when auto-generated; editing marks HUMAN_REVIEWED.</p>
          </div>
        ))}
        <button
          type="button"
          className="cursor-pointer rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          onClick={() => {
            const newId = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
            onChange((prev) => {
              if (!prev) return prev;
              const cur = (prev.payload as Record<string, unknown> | null) ?? {};
              const curItems = Array.isArray(cur.items) ? [...(cur.items as Record<string, unknown>[])] : [];
              return { ...prev, payload: { ...cur, items: [...curItems, { id: newId, imageUrl: "", imageAlt: "", content: "<p></p>", contentJa: "" }] } };
            });
          }}
        >
          + Add item
        </button>
        {items.length === 0 ? <p className="text-xs text-slate-500">Add at least one image + text pair. Each needs an image and text; sticky keeps image visible while long text scrolls.</p> : null}
      </div>
    </div>
  );
}

function EventButtonPayloadEditor({ draft, onChange }: { draft: AdminEventPageSection; onChange: React.Dispatch<React.SetStateAction<AdminEventPageSection | null>> }) {
  const payload = (draft.payload as Record<string, unknown> | null) ?? {};
  const label = String(payload.label ?? "");
  const labelJa = String(payload.labelJa ?? "");
  const href = String(payload.href ?? "/contact");
  const supportingText = String(payload.supportingText ?? "");
  const supportingTextJa = String(payload.supportingTextJa ?? "");
  const variant = String(payload.variant ?? "primary");
  const size = String(payload.size ?? "md");
  const alignment = String(payload.alignment ?? "center");
  const targetBlank = Boolean(payload.targetBlank);
  function updatePayload(patch: Record<string, unknown>) {
    onChange((prev) => {
      if (!prev) return prev;
      return { ...prev, payload: { ...(prev.payload as Record<string, unknown> | null ?? {}), ...patch } };
    });
  }
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
      <p className="text-sm font-semibold text-slate-800">Button / Call to action</p>
      <label className="block text-sm font-medium text-slate-700">
        Button label — English
        <input className={inputClass} value={label} onChange={(e) => updatePayload({ label: e.target.value })} placeholder="Book your retreat" />
      </label>
      <div className="flex justify-end">
        <button
          type="button"
          className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-900 hover:bg-sky-100"
          onClick={async () => {
            try {
              const ja = await translateTextViaApi(label);
              updatePayload({ labelJa: ja });
            } catch (e) {
              alert(e instanceof Error ? e.message : "Translation failed. Check GEMINI_API_KEY.");
            }
          }}
        >
          Translate / Regenerate Japanese
        </button>
      </div>
      <label className="block text-sm font-medium text-slate-700">
        Button label — Japanese (auto, editable)
        <input className={inputClass} value={labelJa} onChange={(e) => updatePayload({ labelJa: e.target.value })} placeholder="日本語ボタン" />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Link ( /contact or https://… )
        <input className={inputClass} value={href} onChange={(e) => updatePayload({ href: e.target.value })} placeholder="/contact" />
      </label>
      <label className="inline-flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={targetBlank} onChange={(e) => updatePayload({ targetBlank: e.target.checked })} /> Open in new tab
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm font-medium text-slate-700">
          Variant
          <select className={inputClass} value={variant} onChange={(e) => updatePayload({ variant: e.target.value })}>
            <option value="primary">Primary</option>
            <option value="warm">Warm</option>
            <option value="secondary">Secondary</option>
            <option value="ghost">Ghost</option>
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Size
          <select className={inputClass} value={size} onChange={(e) => updatePayload({ size: e.target.value })}>
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Alignment
          <select className={inputClass} value={alignment} onChange={(e) => updatePayload({ alignment: e.target.value })}>
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </label>
      </div>
      <RichTextEditor label="Supporting text — English (optional)" value={supportingText} onChange={(html) => updatePayload({ supportingText: html })} placeholder="Optional heading" minHeight={80} />
      <div className="flex justify-end">
        <button
          type="button"
          className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-900 hover:bg-sky-100"
          onClick={async () => {
            try {
              const ja = await translateHtmlViaApi(supportingText);
              updatePayload({ supportingTextJa: ja });
            } catch (e) {
              alert(e instanceof Error ? e.message : "Translation failed. Check GEMINI_API_KEY.");
            }
          }}
        >
          Translate / Regenerate Japanese
        </button>
      </div>
      <RichTextEditor label="Supporting text — Japanese (auto)" value={supportingTextJa} onChange={(html) => updatePayload({ supportingTextJa: html })} placeholder="日本語サポート" minHeight={80} />
    </div>
  );
}

function LayoutEditor({
  draft,
  onChange,
}: {
  draft: AdminEventPageSection;
  onChange: React.Dispatch<React.SetStateAction<AdminEventPageSection | null>>;
}) {
  const layout = draft.layout ?? defaultLayoutForSectionType(draft.sectionType);

  function updateLayout(patch: Partial<SectionLayoutSettings>) {
    const nextPatch = layoutPatchWithImageAspect(patch);
    onChange((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        layout: {
          ...(prev.layout ?? defaultLayoutForSectionType(prev.sectionType)),
          ...nextPatch,
        },
      };
    });
  }

  return (
    <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 p-4">
      <div>
        <p className="text-sm font-semibold text-slate-800">Layout</p>
        <p className="mt-1 text-xs text-slate-500">Background &amp; sizing — same system as Program pages. Preview studio for fine tuning.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Section spacing
          <select
            className={inputClass}
            value={layout.spacing ?? "normal"}
            onChange={(e) => updateLayout({ spacing: e.target.value as SectionLayoutSettings["spacing"] })}
          >
            {SECTION_SPACING_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {SECTION_SPACING_LABELS[option]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Content width
          <select
            className={inputClass}
            value={layout.contentWidth ?? "normal"}
            onChange={(e) => updateLayout({ contentWidth: e.target.value as SectionLayoutSettings["contentWidth"] })}
          >
            {SECTION_WIDTH_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {SECTION_WIDTH_LABELS[option]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Text alignment
          <select
            className={inputClass}
            value={layout.textAlignment ?? "left"}
            onChange={(e) => updateLayout({ textAlignment: e.target.value as SectionLayoutSettings["textAlignment"] })}
          >
            {SECTION_ALIGN_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {SECTION_ALIGN_LABELS[option]}
              </option>
            ))}
          </select>
        </label>
        <div>
          <p className="text-sm font-medium text-slate-700">Text style (whole section)</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SECTION_TEXT_STYLE_TOGGLES.map(({ key, label }) => {
              const active = Boolean(layout.textStyle?.[key as keyof typeof layout.textStyle]);
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    updateLayout({
                      textStyle: { ...layout.textStyle, [key]: !active },
                    })
                  }
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    active ? "bg-slate-900 text-white" : "border border-slate-300 bg-slate-50 text-slate-700 hover:bg-white"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="sm:col-span-2">
          <p className="text-sm font-medium text-slate-700">Section background</p>
          <select
            className={inputClass}
            value={layout.sectionBackground?.mode ?? "auto"}
            onChange={(e) =>
              updateLayout({
                sectionBackground: { ...layout.sectionBackground, mode: e.target.value as TextContainerSettings["mode"] },
              })
            }
          >
            <option value="auto">Auto (default)</option>
            <option value="none">None</option>
            <option value="solid">Solid colour</option>
            <option value="image">Image</option>
          </select>
          {layout.sectionBackground?.mode === "solid" ? (
            <div className="mt-2 flex items-center gap-3">
              <input
                type="color"
                value={layout.sectionBackground?.color ?? "#f5f0e8"}
                onChange={(e) => updateLayout({ sectionBackground: { ...layout.sectionBackground, color: e.target.value } })}
                className="h-10 w-14 rounded border"
              />
              <input
                value={layout.sectionBackground?.color ?? ""}
                onChange={(e) => updateLayout({ sectionBackground: { ...layout.sectionBackground, color: e.target.value } })}
                placeholder="#f5f0e8"
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>
          ) : null}
          {layout.sectionBackground?.mode === "image" ? (
            <div className="mt-2">
              <ImageUploadField
                label="Background image"
                section="pages"
                value={layout.sectionBackground?.imageUrl ?? ""}
                onChange={(url) => updateLayout({ sectionBackground: { ...layout.sectionBackground, imageUrl: url } })}
              />
            </div>
          ) : null}
        </div>
        <div className="sm:col-span-2">
          <p className="text-sm font-medium text-slate-700">Text background</p>
          <select
            className={inputClass}
            value={layout.textContainer?.mode ?? "auto"}
            onChange={(e) =>
              updateLayout({
                textContainer: { ...layout.textContainer, mode: e.target.value as TextContainerSettings["mode"] },
              })
            }
          >
            <option value="auto">Auto (default)</option>
            <option value="none">None / Transparent</option>
            <option value="solid">Solid colour</option>
            <option value="image">Image</option>
          </select>
          {layout.textContainer?.mode === "solid" ? (
            <div className="mt-2 flex items-center gap-3">
              <input
                type="color"
                value={layout.textContainer?.color ?? "#f5f0e8"}
                onChange={(e) => updateLayout({ textContainer: { ...layout.textContainer, color: e.target.value } })}
                className="h-10 w-14 rounded border"
              />
              <input
                value={layout.textContainer?.color ?? ""}
                onChange={(e) => updateLayout({ textContainer: { ...layout.textContainer, color: e.target.value } })}
                placeholder="#f5f0e8"
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>
          ) : null}
          {layout.textContainer?.mode === "image" ? (
            <div className="mt-2">
              <ImageUploadField
                label="Background image"
                section="pages"
                value={layout.textContainer?.imageUrl ?? ""}
                onChange={(url) => updateLayout({ textContainer: { ...layout.textContainer, imageUrl: url } })}
              />
            </div>
          ) : null}
        </div>
        <div className="sm:col-span-2 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-sm font-semibold text-slate-700">Font size — this section</p>
          <p className="text-xs text-slate-500">Overrides global Typography for this section only. Applies to every text field in this section.</p>
          {(() => {
            const headingsSize = (layout.designOverrides as unknown as { typography?: { headings?: { fontSize?: string } } })?.typography?.headings?.fontSize;
            const bodySize = (layout.designOverrides as unknown as { typography?: { body?: { fontSize?: string } } })?.typography?.body?.fontSize;
            const updateSectionFontSize = (role: "headings" | "body", fontSize: string) => {
              const current = (layout.designOverrides ?? {}) as Record<string, unknown>;
              const typography = (current.typography ?? {}) as Record<string, unknown>;
              const roleCurrent = (typography[role] ?? {}) as Record<string, unknown>;
              const nextTypography = { ...typography, [role]: { ...roleCurrent, fontSize } };
              updateLayout({ designOverrides: { ...(layout.designOverrides as object), typography: nextTypography } } as Partial<SectionLayoutSettings>);
            };
            const clearSectionFontSize = (role: "headings" | "body") => {
              const current = (layout.designOverrides ?? {}) as Record<string, unknown>;
              const typography = (current.typography ?? {}) as Record<string, unknown>;
              const nextRole = { ...(typography[role] as Record<string, unknown> ?? {}) };
              delete (nextRole as Record<string, unknown>).fontSize;
              const nextTypography: Record<string, unknown> = { ...typography };
              if (Object.keys(nextRole).length === 0) delete nextTypography[role];
              else nextTypography[role] = nextRole;
              const nextOverrides: Record<string, unknown> = { ...(current as object) };
              if (Object.keys(nextTypography).length === 0) delete nextOverrides.typography;
              else nextOverrides.typography = nextTypography;
              updateLayout({ designOverrides: (Object.keys(nextOverrides).length ? nextOverrides : undefined) as unknown as SectionLayoutSettings["designOverrides"] });
            };
            return (
              <>
                <FontSizeControl label="Heading font size" value={headingsSize} fallback="32px" onChange={(v) => updateSectionFontSize("headings", v)} />
                {headingsSize ? <button type="button" onClick={() => clearSectionFontSize("headings")} className="text-xs text-slate-600 underline">Reset heading size to global</button> : null}
                <FontSizeControl label="Body font size" value={bodySize} fallback="16px" onChange={(v) => updateSectionFontSize("body", v)} />
                {bodySize ? <button type="button" onClick={() => clearSectionFontSize("body")} className="text-xs text-slate-600 underline">Reset body size to global</button> : null}
              </>
            );
          })()}
        </div>
        <div className="sm:col-span-2 space-y-4 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
          <p className="text-sm font-semibold text-slate-800">Heading & spacing — fine tuning</p>
          <p className="text-xs text-slate-500">Heading position uses transform (no layout shift) — same numeric value reproduces same position elsewhere. Clamped to avoid mobile overflow.</p>
          <label className="block text-sm font-medium text-slate-700">
            Heading horizontal offset — {layout.headingOffset ?? 0}px
            <div className="mt-2 flex items-center gap-3">
              <input
                type="range"
                min={-100}
                max={100}
                step={1}
                value={layout.headingOffset ?? 0}
                onChange={(e) => updateLayout({ headingOffset: Number(e.target.value) })}
                className="flex-1"
              />
              <input
                type="number"
                min={-100}
                max={100}
                step={1}
                value={layout.headingOffset ?? 0}
                onChange={(e) => updateLayout({ headingOffset: Number(e.target.value) })}
                className="w-20 rounded-xl border border-slate-300 bg-white px-2 py-1 text-sm"
              />
              <span className="text-xs text-slate-500">px</span>
            </div>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Gap below heading — {layout.headingGap ?? 16}px {draft.subtitle?.trim() ? "" : "(no subtitle — heading gap still applies to body)"}
            <div className="mt-2 flex items-center gap-3">
              <input
                type="range"
                min={-40}
                max={120}
                step={1}
                value={layout.headingGap ?? 16}
                onChange={(e) => updateLayout({ headingGap: Number(e.target.value) })}
                className="flex-1"
              />
              <input
                type="number"
                min={-40}
                max={120}
                step={1}
                value={layout.headingGap ?? 16}
                onChange={(e) => updateLayout({ headingGap: Number(e.target.value) })}
                className="w-20 rounded-xl border border-slate-300 bg-white px-2 py-1 text-sm"
              />
              <span className="text-xs text-slate-500">px</span>
            </div>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Section top padding — {layout.paddingTop ?? 0}px
            <div className="mt-2 flex items-center gap-3">
              <input type="range" min={0} max={160} step={4} value={layout.paddingTop ?? 0} onChange={(e) => updateLayout({ paddingTop: Number(e.target.value) })} className="flex-1" />
              <input type="number" min={0} max={160} step={4} value={layout.paddingTop ?? 0} onChange={(e) => updateLayout({ paddingTop: Number(e.target.value) })} className="w-20 rounded-xl border border-slate-300 bg-white px-2 py-1 text-sm" />
              <span className="text-xs text-slate-500">px</span>
            </div>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Section bottom padding — {layout.paddingBottom ?? 0}px
            <div className="mt-2 flex items-center gap-3">
              <input type="range" min={0} max={160} step={4} value={layout.paddingBottom ?? 0} onChange={(e) => updateLayout({ paddingBottom: Number(e.target.value) })} className="flex-1" />
              <input type="number" min={0} max={160} step={4} value={layout.paddingBottom ?? 0} onChange={(e) => updateLayout({ paddingBottom: Number(e.target.value) })} className="w-20 rounded-xl border border-slate-300 bg-white px-2 py-1 text-sm" />
              <span className="text-xs text-slate-500">px</span>
            </div>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Gap below section — {layout.sectionGap ?? 0}px
            <div className="mt-2 flex items-center gap-3">
              <input type="range" min={0} max={120} step={4} value={layout.sectionGap ?? 0} onChange={(e) => updateLayout({ sectionGap: Number(e.target.value) })} className="flex-1" />
              <input type="number" min={0} max={120} step={4} value={layout.sectionGap ?? 0} onChange={(e) => updateLayout({ sectionGap: Number(e.target.value) })} className="w-20 rounded-xl border border-slate-300 bg-white px-2 py-1 text-sm" />
              <span className="text-xs text-slate-500">px</span>
            </div>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Content max width — {layout.contentWidthPx ?? 960}px
            <div className="mt-2 flex items-center gap-3">
              <input type="range" min={400} max={1400} step={20} value={layout.contentWidthPx ?? 960} onChange={(e) => updateLayout({ contentWidthPx: Number(e.target.value) })} className="flex-1" />
              <input type="number" min={400} max={1400} step={20} value={layout.contentWidthPx ?? 960} onChange={(e) => updateLayout({ contentWidthPx: Number(e.target.value) })} className="w-20 rounded-xl border border-slate-300 bg-white px-2 py-1 text-sm" />
              <span className="text-xs text-slate-500">px</span>
            </div>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Text max width — {layout.textMaxWidthPx ?? 640}px
            <div className="mt-2 flex items-center gap-3">
              <input type="range" min={320} max={900} step={20} value={layout.textMaxWidthPx ?? 640} onChange={(e) => updateLayout({ textMaxWidthPx: Number(e.target.value) })} className="flex-1" />
              <input type="number" min={320} max={900} step={20} value={layout.textMaxWidthPx ?? 640} onChange={(e) => updateLayout({ textMaxWidthPx: Number(e.target.value) })} className="w-20 rounded-xl border border-slate-300 bg-white px-2 py-1 text-sm" />
              <span className="text-xs text-slate-500">px</span>
            </div>
          </label>
        </div>
        {draft.sectionType === "HERO" ? (
          <label className="block text-sm font-medium text-slate-700">
            Image aspect
            <select
              className={inputClass}
              value={layout.imageAspect ?? "landscape"}
              onChange={(e) => updateLayout({ imageAspect: e.target.value as SectionLayoutSettings["imageAspect"] })}
            >
              {SECTION_IMAGE_ASPECT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {SECTION_IMAGE_ASPECT_LABELS[option]}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {draft.sectionType === "IMAGE_TEXT" ? (
          <div className="space-y-3 sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700">
              Image aspect
              <select
                className={inputClass}
                value={layout.imageAspect ?? "compact"}
                onChange={(e) => updateLayout({ imageAspect: e.target.value as SectionLayoutSettings["imageAspect"] })}
              >
                {SECTION_IMAGE_ASPECT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {SECTION_IMAGE_ASPECT_LABELS[option]}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <p className="text-sm font-medium text-slate-700">Image side</p>
              <div className="mt-2 inline-flex rounded-full border border-slate-300 bg-slate-50 p-1" role="group" aria-label="Image side">
                {SECTION_IMAGE_SIDE_OPTIONS.map((option) => {
                  const active = (layout.imageSide ?? "left") === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => updateLayout({ imageSide: option })}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-white"}`}
                    >
                      {SECTION_IMAGE_SIDE_LABELS[option]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
        {draft.sectionType === "GALLERY" ? (
          <label className="block text-sm font-medium text-slate-700">
            Gallery layout
            <select
              className={inputClass}
              value={layout.galleryStyle ?? "horizontal"}
              onChange={(e) => updateLayout({ galleryStyle: e.target.value as SectionLayoutSettings["galleryStyle"] })}
            >
              {SECTION_GALLERY_STYLE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {SECTION_GALLERY_STYLE_LABELS[option]}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
    </div>
  );
}
