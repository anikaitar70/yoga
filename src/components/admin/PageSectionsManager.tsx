"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { LocaleEditorTabs, type EditorLocale } from "@/components/admin/LocaleEditorTabs";
import { MachineTranslationNote } from "@/components/admin/LocaleContentEditor";
import { adminDeleteRequest, adminJsonRequest } from "@/lib/admin-fetch";
import type { LocaleContentStore, LocalePageSectionPatch } from "@/lib/i18n/locale-content";
import type { AdminPageSection } from "@/lib/admin-types";
import {
  PAGE_SECTION_TYPE_LABELS,
  PAGE_SECTION_TYPES,
  PAGE_TYPE_LABELS,
  PAGE_TYPES,
  type PageSectionType,
  type PageType,
} from "@/lib/page-section-types";
import {
  defaultPayloadForSectionType,
  parseCustomTextPayload,
  sanitizeTestimonialsPayload,
} from "@/lib/page-section-payloads";
import { normalizeArtJourneyTimelinePayload } from "@/lib/custom-text-payload";
import { applyTimelineStyleScope } from "@/lib/timeline-style-save";
import type { CustomTextSectionPayload } from "@/lib/page-section-types";
import { EVENT_CATEGORY_OPTIONS } from "@/lib/event-categories";
import {
  defaultLayoutForSectionType,
  SECTION_ALIGN_LABELS,
  SECTION_ALIGN_OPTIONS,
  SECTION_IMAGE_ASPECT_LABELS,
  SECTION_IMAGE_ASPECT_OPTIONS,
  SECTION_IMAGE_SIDE_LABELS,
  SECTION_IMAGE_SIDE_OPTIONS,
  SECTION_SPACING_LABELS,
  SECTION_SPACING_OPTIONS,
  SECTION_WIDTH_LABELS,
  SECTION_WIDTH_OPTIONS,
  SECTION_GALLERY_STYLE_LABELS,
  SECTION_GALLERY_STYLE_OPTIONS,
  TEXT_CONTAINER_MODE_OPTIONS,
  layoutPatchWithImageAspect,
  type SectionLayoutSettings,
  type TextContainerSettings,
} from "@/lib/section-layout";
import Link from "next/link";
import { CustomTextPayloadEditor } from "@/components/admin/CustomTextPayloadEditor";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { TestimonialSelector } from "@/components/admin/TestimonialSelector";
import { FontSizeControl } from "@/components/admin/FontSizeControl";
import { paragraphsToContent } from "@/lib/page-section-types";
import { translateHtmlViaApi, translateTextViaApi } from "@/lib/auto-translate";

type Props = {
  initialByPage: Record<PageType, AdminPageSection[]>;
  initialLocaleContent?: LocaleContentStore;
};

type PayloadPatch = Record<string, unknown>;
type PayloadUpdater = (payload: Record<string, unknown>) => PayloadPatch;

function countReadyTestimonialItems(payload: unknown): number {
  const summary = summarizeTestimonialPayload(payload);
  return summary.items.filter(
    (item) => item.hasQuote || item.hasName || item.hasRole || item.hasImageUrl,
  ).length;
}

function ensureTestimonialsPayload(
  payload: Record<string, unknown> | null | undefined,
): Record<string, unknown> {
  const base = payload ? { ...payload } : { items: [] };
  const items = Array.isArray(base.items) ? [...(base.items as Record<string, unknown>[])] : [];
  if (items.length === 0) {
    return { ...base, items: [{ quote: "", name: "", role: "", imageUrl: "" }] };
  }
  return { ...base, items };
}

function summarizeTestimonialPayload(payload: unknown) {
  const items =
    typeof payload === "object" &&
    payload !== null &&
    "items" in payload &&
    Array.isArray((payload as { items?: unknown }).items)
      ? (payload as { items: unknown[] }).items
      : [];

  return {
    itemCount: items.length,
    items: items.map((item, index) => {
      const record = typeof item === "object" && item !== null ? (item as Record<string, unknown>) : {};
      return {
        index,
        hasQuote: typeof record.quote === "string" && record.quote.trim().length > 0,
        quoteLength: typeof record.quote === "string" ? record.quote.trim().length : 0,
        hasName: typeof record.name === "string" && record.name.trim().length > 0,
        hasRole: typeof record.role === "string" && record.role.trim().length > 0,
        hasImageUrl: typeof record.imageUrl === "string" && record.imageUrl.trim().length > 0,
        imageUrlValue:
          typeof record.imageUrl === "string"
            ? record.imageUrl.trim()
              ? "[present]"
              : "[blank-string]"
            : "[missing]",
      };
    }),
  };
}

function mapSection(raw: Record<string, unknown>): AdminPageSection {
  return {
    id: String(raw.id),
    pageType: raw.pageType as PageType,
    sectionType: String(raw.sectionType),
    title: raw.title != null ? String(raw.title) : null,
    subtitle: raw.subtitle != null ? String(raw.subtitle) : null,
    content: raw.content != null ? String(raw.content) : null,
    imageUrl: raw.imageUrl != null ? String(raw.imageUrl) : null,
    imageAlt: raw.imageAlt != null ? String(raw.imageAlt) : null,
    sortOrder: Number(raw.sortOrder),
    isPublished: Boolean(raw.isPublished),
    layout: (raw.layout as SectionLayoutSettings | null) ?? null,
    payload: (raw.payload as Record<string, unknown> | null) ?? null,
  };
}

const inputClass =
  "mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

const SECTION_TEXT_STYLE_TOGGLES = [
  { key: "bold", label: "B — Bold" },
  { key: "italic", label: "I — Italic" },
  { key: "underline", label: "U — Underline" },
] as const;

const iconBtnClass =
  "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-300 disabled:hover:bg-white";

function IconChevronUp() {
  return (
    <svg aria-hidden className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M10 3a.75.75 0 01.53.22l4.5 4.5a.75.75 0 11-1.06 1.06L10 5.31 6.03 9.28a.75.75 0 11-1.06-1.06l4.5-4.5A.75.75 0 0110 3z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg aria-hidden className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M10 17a.75.75 0 01-.53-.22l-4.5-4.5a.75.75 0 111.06-1.06L10 14.69l3.97-3.97a.75.75 0 111.06 1.06l-4.5 4.5A.75.75 0 0110 17z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function IconPencil() {
  return (
    <svg aria-hidden className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path d="M2.695 14.763l-1.262 3.154a.75.75 0 001.164.865l3.154-1.262a4 4 0 002.343-1.098l6.364-6.364a2.25 2.25 0 00-3.182-3.182L4.793 12.48a4 4 0 00-1.098 2.283zM12.48 4.793l1.414 1.414-6.364 6.364-1.414-1.414 6.364-6.364z" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg aria-hidden className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M8.75 2A2.25 2.25 0 006.5 4.25v.75H4.25a.75.75 0 000 1.5h11.5a.75.75 0 000-1.5H13.5v-.75A2.25 2.25 0 0011.25 2h-2.5zm-3.5 4.5v9.75A2.25 2.25 0 007.5 18.5h5a2.25 2.25 0 002.25-2.25V7.25h-9.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function PageSectionsManager({ initialByPage, initialLocaleContent }: Props) {
  const router = useRouter();
  const [pageType, setPageType] = useState<PageType>("YOGA");
  const [sections, setSections] = useState<AdminPageSection[]>(initialByPage.YOGA ?? []);
  const [localeContent, setLocaleContent] = useState<LocaleContentStore>(initialLocaleContent ?? {});
  const [contentLocale, setContentLocale] = useState<EditorLocale>("en");
  const [sectionJaDraft, setSectionJaDraft] = useState<LocalePageSectionPatch>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AdminPageSection | null>(null);
  const draftRef = useRef<AdminPageSection | null>(null);
  draftRef.current = draft;

  const patchDraft = useCallback(
    (patch: Partial<AdminPageSection> | ((section: AdminPageSection) => AdminPageSection)) => {
      setDraft((current) => {
        if (!current) return current;
        return typeof patch === "function" ? patch(current) : { ...current, ...patch };
      });
    },
    [],
  );
  const [busy, setBusy] = useState(false);
  const [translateBusy, setTranslateBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const initialByPageRef = useRef(initialByPage);
  initialByPageRef.current = initialByPage;

  useEffect(() => {
    if (!draft) {
      setSectionJaDraft({});
      return;
    }
    const index = sections.findIndex((section) => section.id === draft.id);
    const patch = localeContent.ja?.pageSections?.[pageType]?.[index] ?? {};
    setSectionJaDraft(patch);
  }, [draft?.id, pageType, sections, localeContent]);

  function compactSectionJaPatch(patch: LocalePageSectionPatch): LocalePageSectionPatch {
    const next: LocalePageSectionPatch = {};
    if (patch.title?.trim()) next.title = patch.title.trim();
    if (patch.subtitle?.trim()) next.subtitle = patch.subtitle.trim();
    if (patch.content?.trim()) next.content = patch.content.trim();
    if (patch.imageAlt?.trim()) next.imageAlt = patch.imageAlt.trim();
    if (patch.payload) next.payload = patch.payload;
    return next;
  }

  async function persistSectionLocale(index: number, patch: LocalePageSectionPatch) {
    const existing = [...(localeContent.ja?.pageSections?.[pageType] ?? [])];
    while (existing.length <= index) existing.push({});
    existing[index] = compactSectionJaPatch(patch);
    const hasContent = Object.keys(existing[index] ?? {}).length > 0;
    if (!hasContent) {
      existing[index] = {};
    }
    const nextLocale: LocaleContentStore = {
      ...localeContent,
      ja: {
        ...localeContent.ja,
        pageSections: {
          ...localeContent.ja?.pageSections,
          [pageType]: existing,
        },
      },
    };
    await adminJsonRequest("/api/cms/site", "PUT", { localeContent: nextLocale });
    setLocaleContent(nextLocale);
  }

  const loadSections = useCallback(async (type: PageType) => {
    const data = await adminJsonRequest<Record<string, unknown>[]>(
      `/api/cms/page-sections?pageType=${type}`,
      "GET",
    );
    setSections(data.map(mapSection));
  }, []);

  useEffect(() => {
    setActiveId(null);
    setDraft(null);

    void (async () => {
      try {
        await loadSections(pageType);
      } catch (error) {
        setSections(initialByPageRef.current[pageType] ?? []);
        setMessage(
          error instanceof Error ? error.message : "Could not load sections from the server.",
        );
      }
    })();
  }, [pageType, loadSections]);

  function startEdit(section: AdminPageSection) {
    setActiveId(section.id);
    let payload: Record<string, unknown> | null = section.payload
      ? { ...section.payload }
      : (defaultPayloadForSectionType(section.sectionType, section.pageType) as Record<string, unknown> | null);
    if (section.sectionType === "TESTIMONIALS") {
      payload = ensureTestimonialsPayload(payload as Record<string, unknown>);
    }
    // Unified Image + Text: legacy single-image rows become one item so the same editor is used.
    if (section.sectionType === "IMAGE_TEXT" || section.sectionType === "DYNAMIC_IMAGE_TEXT") {
      const items = Array.isArray((payload as { items?: unknown })?.items) ? (payload as { items: unknown[] }).items : [];
      const hasItems = items.length > 0;
      if (!hasItems && (section.content?.trim() || section.imageUrl?.trim())) {
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
      if (!payload) payload = { items: [] } as unknown as Record<string, unknown>;
      if (!Array.isArray((payload as { items?: unknown }).items)) (payload as { items: unknown[] }).items = [];
    }
    setDraft({
      ...section,
      layout: section.layout ? { ...section.layout } : defaultLayoutForSectionType(section.sectionType),
      payload,
    });
    setMessage(null);

    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      titleInputRef.current?.focus({ preventScroll: true });
    });
  }

  async function addSection(sectionType: PageSectionType) {
    setBusy(true);
    setMessage(null);
    try {
      const payload = defaultPayloadForSectionType(sectionType, pageType) ?? {};
      if (sectionType === "EVENTS") {
        if (pageType === "HEALING") Object.assign(payload, { categories: ["HEALING"], eventKind: "sessions" });
        if (pageType === "YOGA") Object.assign(payload, { categories: ["YOGA"], eventKind: "sessions" });
        if (pageType === "JUST_ART_LIFE")
          Object.assign(payload, { categories: ["JUST_ART_LIFE", "YOGA"], eventKind: "all" });
      }

      const created = await adminJsonRequest<Record<string, unknown>>("/api/cms/page-sections", "POST", {
        pageType,
        sectionType,
        title: PAGE_SECTION_TYPE_LABELS[sectionType],
        isPublished: false,
        layout: defaultLayoutForSectionType(sectionType),
        payload,
      });
      await loadSections(pageType);
      router.refresh();
      startEdit(mapSection(created));
      setMessage("Section added.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to add section.");
    } finally {
      setBusy(false);
    }
  }

  function normalizePayloadForSave(section: AdminPageSection): Record<string, unknown> | null {
    if (!section.payload) return null;
    const payload = { ...section.payload };

    if (section.sectionType === "GALLERY" && Array.isArray(payload.images)) {
      payload.images = payload.images.filter(
        (img: { url?: string; alt?: string }) => img.url?.trim() && img.alt?.trim(),
      );
    }

    if (section.sectionType === "TESTIMONIALS") {
      const sanitized = sanitizeTestimonialsPayload(
        payload as { items?: { quote?: string; name?: string; role?: string; imageUrl?: string; imageAlt?: string }[] },
      );
      console.info("[testimonial-save:client:normalize]", {
        sectionId: section.id,
        raw: summarizeTestimonialPayload(payload),
        sanitized: summarizeTestimonialPayload(sanitized),
      });
      return sanitized;
    }

    if (section.sectionType === "CUSTOM_TEXT") {
      const parsed = parseCustomTextPayload(payload, section.pageType) as ReturnType<
        typeof parseCustomTextPayload
      > & {
        sutra?: { sanskrit?: string; enabled?: boolean };
        sutraEnabled?: boolean;
      };
      let normalized = parsed as CustomTextSectionPayload;
      if (normalized.variant === "art-journey") {
        normalized = normalizeArtJourneyTimelinePayload(normalized);
      }
      if (normalized.sutraEnabled === false || normalized.sutra?.enabled === false) {
        const { sutra: _removed, ...rest } = normalized;
        return rest;
      }
      if (normalized.sutra && !normalized.sutra.sanskrit?.trim()) {
        const { sutra: _removed, ...rest } = normalized;
        return rest;
      }
      return normalized;
    }

    if (section.sectionType === "IMAGE_TEXT" || section.sectionType === "DYNAMIC_IMAGE_TEXT") {
      const rawItems = Array.isArray(payload.items) ? (payload.items as Record<string, unknown>[]) : [];
      // Keep draft items with imageUrl OR content so partial edits are not lost; public render will filter invalid.
      // For publish, API will enforce imageUrl+content, but we keep lenient here to avoid losing user edits on save draft.
      const items = rawItems
        .map((it) => ({
          id: typeof it.id === "string" && it.id.trim() ? it.id : `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          imageUrl: typeof it.imageUrl === "string" ? String(it.imageUrl).trim() : "",
          imageAlt: typeof it.imageAlt === "string" ? it.imageAlt.trim() : undefined,
          content: typeof it.content === "string" ? String(it.content) : "",
          contentJa: typeof it.contentJa === "string" && it.contentJa.trim() ? String(it.contentJa) : undefined,
        }))
        // Keep if at least imageUrl or content present — allows saving draft mid-edit
        .filter((it) => Boolean(it.imageUrl || it.content.trim()));
      return {
        scrollBehavior: payload.scrollBehavior ?? "sticky",
        layoutDirection: payload.layoutDirection ?? "image-left",
        imageHeight: payload.imageHeight ?? "medium",
        imageFit: payload.imageFit ?? "cover",
        items,
      };
    }

    return payload;
  }

  function buildUpdatePayload(section: AdminPageSection) {
    const imageUrl = section.imageUrl?.trim();
    const isCustomText = section.sectionType === "CUSTOM_TEXT";
    const isImageText = section.sectionType === "IMAGE_TEXT" || section.sectionType === "DYNAMIC_IMAGE_TEXT";
    const customParagraphs = isCustomText
      ? ((section.payload?.paragraphs as string[] | undefined) ?? [])
      : [];
    return {
      title: section.title ?? "",
      subtitle: section.subtitle ?? "",
      content: isCustomText ? paragraphsToContent(customParagraphs) : isImageText ? "" : (section.content ?? ""),
      imageUrl: isCustomText || isImageText ? null : imageUrl ? imageUrl : null,
      imageAlt: isCustomText || isImageText ? "" : (section.imageAlt ?? ""),
      isPublished: section.isPublished,
      layout: section.layout ?? defaultLayoutForSectionType(section.sectionType),
      payload: normalizePayloadForSave(section),
    };
  }

  async function saveSection(publish: boolean) {
    const currentDraft = draftRef.current;
    if (!currentDraft) return;
    setBusy(true);
    setMessage(null);
    try {
      const requestBody = {
        ...buildUpdatePayload({ ...currentDraft, isPublished: publish }),
        isPublished: publish,
      };
      if (currentDraft.sectionType === "TESTIMONIALS") {
        const readyCount = countReadyTestimonialItems(requestBody.payload);
        const payloadSummary = summarizeTestimonialPayload(requestBody.payload);
        console.info("[testimonial-save:client:pre-save]", {
          sectionId: currentDraft.id,
          publish,
          draftPayload: summarizeTestimonialPayload(currentDraft.payload),
          requestPayload: payloadSummary,
          readyCount,
        });
        if (readyCount === 0) {
          console.warn("[testimonial-save:client:blocked-empty]", {
            sectionId: currentDraft.id,
            publish,
            payload: payloadSummary,
          });
          setMessage(
            "No testimonial items to save. Use the testimonial cards below (not the section image at the top) and fill at least one of quote, photo, name, or role.",
          );
          return;
        }
      }
      const saved = await adminJsonRequest<Record<string, unknown>>(
        `/api/cms/page-sections/${currentDraft.id}`,
        "PUT",
        requestBody,
      );

      if (currentDraft.sectionType === "CUSTOM_TEXT") {
        const customPayload = currentDraft.payload as CustomTextSectionPayload | undefined;
        if (customPayload?.timelineStyle && customPayload.timelineStyleScope !== "section") {
          await applyTimelineStyleScope({
            scope: customPayload.timelineStyleScope,
            pageType: currentDraft.pageType,
            style: customPayload.timelineStyle,
            getSite: () => adminJsonRequest<Record<string, unknown>>("/api/cms/site", "GET"),
            patchSite: (payload) => adminJsonRequest("/api/cms/site", "PUT", payload),
          });
        }
      }

      if (currentDraft.sectionType === "TESTIMONIALS") {
        console.info("[testimonial-save:client:response]", {
          sectionId: currentDraft.id,
          responsePayload: summarizeTestimonialPayload((saved as { payload?: unknown }).payload),
        });
      }
      const mapped = mapSection(saved);
      const sectionIndex = sections.findIndex((section) => section.id === mapped.id);
      if (sectionIndex >= 0) {
        await persistSectionLocale(sectionIndex, sectionJaDraft);
      }
      await loadSections(pageType);
      router.refresh();
      setDraft(
        mapped.sectionType === "TESTIMONIALS"
          ? {
              ...mapped,
              payload: ensureTestimonialsPayload(mapped.payload as Record<string, unknown>),
            }
          : mapped,
      );
      setActiveId(mapped.id);

      let statusMessage = publish
        ? "Section published to the live site."
        : "Draft saved. Preview the page before publishing.";

      if (mapped.sectionType === "TESTIMONIALS" && mapped.payload && Array.isArray(mapped.payload.items)) {
        const count = mapped.payload.items.length;
        if (count === 0) {
          statusMessage +=
            " No testimonial items were saved — add a quote, photo, name, or role to each row.";
        } else {
          statusMessage += ` ${count} testimonial${count === 1 ? "" : "s"} saved.`;
        }
      }

      setMessage(statusMessage);
    } catch (error) {
      if (currentDraft.sectionType === "TESTIMONIALS") {
        console.error("[testimonial-save:client:error]", {
          sectionId: currentDraft.id,
          error: error instanceof Error ? error.message : String(error),
          draftPayload: summarizeTestimonialPayload(currentDraft.payload),
        });
      }
      setMessage(error instanceof Error ? error.message : "Unable to save section.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteSection(id: string) {
    if (!window.confirm("Delete this section? This removes it from the public page.")) return;
    setBusy(true);
    setMessage(null);
    try {
      await adminDeleteRequest(`/api/cms/page-sections/${encodeURIComponent(id)}`);
      setSections((current) => current.filter((section) => section.id !== id));
      if (activeId === id) {
        setActiveId(null);
        setDraft(null);
      }
      await loadSections(pageType);
      router.refresh();
      setMessage("Section deleted. Refresh the public page if it still looks cached.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete section.");
    } finally {
      setBusy(false);
    }
  }

  async function moveSection(id: string, direction: "up" | "down") {
    const index = sections.findIndex((s) => s.id === id);
    if (index < 0) return;
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= sections.length) return;

    const reordered = [...sections];
    const [item] = reordered.splice(index, 1);
    reordered.splice(target, 0, item);

    setBusy(true);
    try {
      const updated = await adminJsonRequest<Record<string, unknown>[]>(
        "/api/cms/page-sections/reorder",
        "PATCH",
        { pageType, orderedIds: reordered.map((s) => s.id) },
      );
      setSections(updated.map(mapSection));
      router.refresh();
    } catch {
      setMessage("Unable to reorder sections.");
    } finally {
      setBusy(false);
    }
  }

  const updatePayload = useCallback((patchOrUpdater: PayloadPatch | PayloadUpdater) => {
    setDraft((current) => {
      if (!current) return current;
      const base = { ...(current.payload ?? {}) };
      const patch = typeof patchOrUpdater === "function" ? patchOrUpdater(base) : patchOrUpdater;
      const next = { ...current, payload: { ...base, ...patch } };
      if (current.sectionType === "TESTIMONIALS" && "items" in patch) {
        console.info("[testimonial-save:client:items-updated]", {
          sectionId: current.id,
          payload: summarizeTestimonialPayload(next.payload),
          readyCount: countReadyTestimonialItems(next.payload),
        });
      }
      return next;
    });
  }, []);

  const testimonialReadyCount = useMemo(() => {
    if (draft?.sectionType !== "TESTIMONIALS") return 0;
    return countReadyTestimonialItems(draft.payload);
  }, [draft]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {PAGE_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setPageType(type)}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              pageType === type
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {PAGE_TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      {message ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      ) : null}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{PAGE_TYPE_LABELS[pageType]} sections</h2>
            <p className="mt-1 text-sm text-slate-600">
              Reorder with arrows. Save drafts, preview the page, then publish when ready.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <Link
              href={`/admin/pages/preview/${pageType}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Preview studio — {PAGE_TYPE_LABELS[pageType]}
            </Link>
            <label className="text-sm font-medium text-slate-700">
            Add section
            <select
              className={inputClass}
              defaultValue=""
              disabled={busy}
              onChange={(event) => {
                const value = event.target.value as PageSectionType;
                if (value) {
                  void addSection(value);
                  event.target.value = "";
                }
              }}
            >
              <option value="">Choose type…</option>
              {PAGE_SECTION_TYPES.filter((type) => type !== "DYNAMIC_IMAGE_TEXT").map((type) => (
                <option key={type} value={type}>
                  {PAGE_SECTION_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
            </label>
          </div>
        </div>

        <ul className="mt-6 space-y-3">
          {sections.map((section, index) => (
            <li
              key={section.id}
              className={`rounded-2xl border bg-slate-50 p-4 transition ${
                activeId === section.id
                  ? "border-slate-900 ring-2 ring-slate-900/10"
                  : "border-slate-200"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {PAGE_SECTION_TYPE_LABELS[section.sectionType as PageSectionType] ?? section.sectionType}
                    {!section.isPublished ? " · Draft" : ""}
                  </p>
                  <p className="mt-1 font-medium text-slate-900">{section.title || "Untitled section"}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={busy || index === 0}
                    onClick={() => moveSection(section.id, "up")}
                    className={iconBtnClass}
                    title="Move section up"
                    aria-label={`Move “${section.title || "section"}” up`}
                  >
                    <IconChevronUp />
                  </button>
                  <button
                    type="button"
                    disabled={busy || index === sections.length - 1}
                    onClick={() => moveSection(section.id, "down")}
                    className={iconBtnClass}
                    title="Move section down"
                    aria-label={`Move “${section.title || "section"}” down`}
                  >
                    <IconChevronDown />
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(section)}
                    className={`${iconBtnClass} w-auto gap-1.5 px-3 text-xs font-semibold hover:bg-slate-900 hover:text-white`}
                    title="Edit section"
                    aria-label={`Edit “${section.title || "section"}”`}
                  >
                    <IconPencil />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSection(section.id)}
                    className={`${iconBtnClass} border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50`}
                    title="Delete section"
                    aria-label={`Delete “${section.title || "section"}”`}
                  >
                    <IconTrash />
                  </button>
                </div>
              </div>
            </li>
          ))}
          {sections.length === 0 ? (
            <p className="text-sm text-slate-600">
              No sections yet — the public page shows a placeholder until you add and publish sections here.
            </p>
          ) : null}
        </ul>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Testimonials for this page</h3>
        <p className="mt-1 text-xs text-slate-500">
          Select existing testimonials to feature on the {PAGE_TYPE_LABELS[pageType]} page. Leave empty to use manual section items or global fallback.
        </p>
        <div className="mt-3">
          <TestimonialSelector scope="program" pageType={pageType} onMessage={setMessage} />
        </div>
      </div>

      {draft ? (
        <section
          ref={formRef}
          className="scroll-mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-900/5"
        >
          <h3 className="text-lg font-semibold text-slate-900">Edit section</h3>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              {PAGE_SECTION_TYPE_LABELS[draft.sectionType as PageSectionType] ?? draft.sectionType}
              {activeId ? ` · ${sections.find((s) => s.id === activeId)?.title || "Untitled"}` : ""}
            </p>
            <LocaleEditorTabs activeLocale={contentLocale} onChange={setContentLocale} />
          </div>
          <div className="mt-2">
            <MachineTranslationNote />
          </div>
          <div className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Title{contentLocale === "ja" ? " (日本語)" : ""}
              <input
                ref={titleInputRef}
                value={contentLocale === "en" ? (draft.title ?? "") : (sectionJaDraft.title ?? "")}
                onChange={(e) =>
                  contentLocale === "en"
                    ? patchDraft({ title: e.target.value })
                    : setSectionJaDraft({ ...sectionJaDraft, title: e.target.value })
                }
                placeholder={contentLocale === "ja" ? draft.title ?? "" : undefined}
                className={inputClass}
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
                    setSectionJaDraft((prev) => ({ ...prev, title: ja }));
                    setMessage("Title translated to Japanese (MACHINE). Review and save.");
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
              Subtitle / eyebrow{contentLocale === "ja" ? " (日本語)" : ""}
              <input
                value={contentLocale === "en" ? (draft.subtitle ?? "") : (sectionJaDraft.subtitle ?? "")}
                onChange={(e) =>
                  contentLocale === "en"
                    ? patchDraft({ subtitle: e.target.value })
                    : setSectionJaDraft({ ...sectionJaDraft, subtitle: e.target.value })
                }
                placeholder={contentLocale === "ja" ? draft.subtitle ?? "" : undefined}
                className={inputClass}
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
                    setSectionJaDraft((prev) => ({ ...prev, subtitle: ja }));
                    setMessage("Subtitle translated to Japanese (MACHINE).");
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
            {draft.sectionType === "CUSTOM_TEXT" ? null : draft.sectionType === "IMAGE_TEXT" || draft.sectionType === "DYNAMIC_IMAGE_TEXT" ? null : draft.sectionType !== "TESTIMONIALS" ? (
              <>
                <RichTextEditor
                  label={`Body text${contentLocale === "ja" ? " (日本語)" : ""}`}
                  value={
                    contentLocale === "en" ? (draft.content ?? "") : (sectionJaDraft.content ?? "")
                  }
                  onChange={(html) =>
                    contentLocale === "en"
                      ? patchDraft({ content: html })
                      : setSectionJaDraft({ ...sectionJaDraft, content: html })
                  }
                  placeholder={
                    contentLocale === "ja" && !sectionJaDraft.content
                      ? "日本語訳を入力…"
                      : "Section body text"
                  }
                  minHeight={140}
                />
                <ImageUploadField
                  label="Section image"
                  section="pages"
                  value={draft.imageUrl ?? ""}
                  onChange={(url) => patchDraft({ imageUrl: url })}
                />
                <label className="block text-sm font-medium text-slate-700">
                  Image alt text
                  <input
                    value={draft.imageAlt ?? ""}
                    onChange={(e) => patchDraft({ imageAlt: e.target.value })}
                    className={inputClass}
                  />
                </label>
              </>
            ) : (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                Add each testimonial in the cards below. The section image field is hidden here so uploads
                go into testimonial items, not the section header.
              </p>
            )}
            {draft.sectionType === "IMAGE_TEXT" || draft.sectionType === "DYNAMIC_IMAGE_TEXT" ? (
              <p className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
                This section uses multiple image/text items below. Add items in the editor below — each item has its own image and rich text (English + Japanese).
              </p>
            ) : null}
            <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={draft.isPublished}
                onChange={(e) => patchDraft({ isPublished: e.target.checked })}
                className="h-5 w-5"
              />
              Published (visible on site)
            </label>

            <LayoutEditor draft={draft} onChange={patchDraft} />

            <PayloadEditor draft={draft} onChange={setDraft} updatePayload={updatePayload} />

            {draft.sectionType === "TESTIMONIALS" ? (
              <p
                className={`text-sm font-medium ${
                  testimonialReadyCount > 0 ? "text-emerald-700" : "text-amber-800"
                }`}
              >
                {testimonialReadyCount > 0
                  ? `${testimonialReadyCount} testimonial${testimonialReadyCount === 1 ? "" : "s"} ready to save.`
                  : "No testimonial content yet — fill a card below (quote, photo, name, or role)."}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3 pt-4">
              <button
                type="button"
                disabled={busy}
                onClick={() => saveSection(false)}
                className="cursor-pointer rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? "Saving…" : "Save draft"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => saveSection(true)}
                className="cursor-pointer rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? "Publishing…" : "Publish"}
              </button>
              <Link
                href={`/admin/pages/preview/${pageType}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Preview studio
              </Link>
              <button
                type="button"
                onClick={() => {
                  setDraft(null);
                  setActiveId(null);
                }}
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function LayoutEditor({
  draft,
  onChange,
}: {
  draft: AdminPageSection;
  onChange: (section: AdminPageSection | ((current: AdminPageSection) => AdminPageSection)) => void;
}) {
  const layout = draft.layout ?? defaultLayoutForSectionType(draft.sectionType);

  function updateLayout(patch: Partial<SectionLayoutSettings>) {
    const nextPatch = layoutPatchWithImageAspect(patch);
    onChange((section) => ({
      ...section,
      layout: {
        ...(section.layout ?? defaultLayoutForSectionType(section.sectionType)),
        ...nextPatch,
      },
    }));
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
      <div>
        <p className="text-sm font-semibold text-slate-800">Layout</p>
        <p className="mt-1 text-xs text-slate-500">
          Safe sizing presets here. Open Preview studio for fine-tuned sliders (desktop/mobile).
        </p>
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
              const active = Boolean(layout.textStyle?.[key]);
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
                    active
                      ? "bg-slate-900 text-white"
                      : "border border-slate-300 bg-slate-50 text-slate-700 hover:bg-white"
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
                onChange={(e) =>
                  updateLayout({ sectionBackground: { ...layout.sectionBackground, color: e.target.value } })
                }
                className="h-10 w-14 rounded border"
              />
              <input
                value={layout.sectionBackground?.color ?? ""}
                onChange={(e) =>
                  updateLayout({ sectionBackground: { ...layout.sectionBackground, color: e.target.value } })
                }
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
                onChange={(e) =>
                  updateLayout({ textContainer: { ...layout.textContainer, color: e.target.value } })
                }
                className="h-10 w-14 rounded border"
              />
              <input
                value={layout.textContainer?.color ?? ""}
                onChange={(e) =>
                  updateLayout({ textContainer: { ...layout.textContainer, color: e.target.value } })
                }
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
          <p className="text-xs text-slate-500">Overrides the global Typography settings for this section only. Every text field in this section uses these sizes.</p>
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
                <FontSizeControl label="Heading font size (title, section headings)" value={headingsSize} fallback="32px" onChange={(v) => updateSectionFontSize("headings", v)} />
                {headingsSize ? <button type="button" onClick={() => clearSectionFontSize("headings")} className="text-xs text-slate-600 underline">Reset heading size to global</button> : null}
                <FontSizeControl label="Body font size (paragraphs, rich text, testimonials)" value={bodySize} fallback="16px" onChange={(v) => updateSectionFontSize("body", v)} />
                {bodySize ? <button type="button" onClick={() => clearSectionFontSize("body")} className="text-xs text-slate-600 underline">Reset body size to global</button> : null}
              </>
            );
          })()}
        </div>
        <div className="sm:col-span-2 space-y-4 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
          <p className="text-sm font-semibold text-slate-800">Heading & spacing — fine tuning</p>
          <p className="text-xs text-slate-500">Same controls as Special Events — heading offset uses transform, collapsed when no subtitle.</p>
          <label className="block text-sm font-medium text-slate-700">
            Heading horizontal offset — {layout.headingOffset ?? 0}px
            <div className="mt-2 flex items-center gap-3">
              <input type="range" min={-100} max={100} step={1} value={layout.headingOffset ?? 0} onChange={(e) => updateLayout({ headingOffset: Number(e.target.value) })} className="flex-1" />
              <input type="number" min={-100} max={100} step={1} value={layout.headingOffset ?? 0} onChange={(e) => updateLayout({ headingOffset: Number(e.target.value) })} className="w-20 rounded-xl border border-slate-300 bg-white px-2 py-1 text-sm" />
              <span className="text-xs text-slate-500">px</span>
            </div>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Gap below heading — {layout.headingGap ?? 16}px
            <div className="mt-2 flex items-center gap-3">
              <input type="range" min={-40} max={120} step={1} value={layout.headingGap ?? 16} onChange={(e) => updateLayout({ headingGap: Number(e.target.value) })} className="flex-1" />
              <input type="number" min={-40} max={120} step={1} value={layout.headingGap ?? 16} onChange={(e) => updateLayout({ headingGap: Number(e.target.value) })} className="w-20 rounded-xl border border-slate-300 bg-white px-2 py-1 text-sm" />
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
        </div>
        {draft.sectionType === "HERO" && (
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
        )}
        {draft.sectionType === "IMAGE_TEXT" && (
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
              <div
                className="mt-2 inline-flex rounded-full border border-slate-300 bg-slate-50 p-1"
                role="group"
                aria-label="Image side"
              >
                {SECTION_IMAGE_SIDE_OPTIONS.map((option) => {
                  const active = (layout.imageSide ?? "left") === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => updateLayout({ imageSide: option })}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                        active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-white"
                      }`}
                    >
                      {SECTION_IMAGE_SIDE_LABELS[option]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {draft.sectionType === "GALLERY" ? (
          <label className="block text-sm font-medium text-slate-700">
            Gallery layout
            <select
              className={inputClass}
              value={layout.galleryStyle ?? "horizontal"}
              onChange={(e) =>
                updateLayout({ galleryStyle: e.target.value as SectionLayoutSettings["galleryStyle"] })
              }
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

function PayloadEditor({
  draft,
  onChange,
  updatePayload,
}: {
  draft: AdminPageSection;
  onChange: (section: AdminPageSection) => void;
  updatePayload: (patchOrUpdater: PayloadPatch | PayloadUpdater) => void;
}) {
  const type = draft.sectionType;
  const pageType = draft.pageType;
  const payload = draft.payload ?? {};

  if (type === "HERO") {
    return (
      <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-800">Hero tagline &amp; calls to action</p>
        <input
          placeholder="Tagline (e.g. Awareness · Balance · Connection)"
          className={inputClass}
          value={String(payload.tagline ?? "")}
          onChange={(e) => updatePayload({ tagline: e.target.value })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            placeholder="Primary CTA label"
            className={inputClass}
            value={String((payload.primaryCta as { label?: string })?.label ?? "")}
            onChange={(e) =>
              updatePayload({
                primaryCta: {
                  ...((payload.primaryCta as object) ?? {}),
                  label: e.target.value,
                  href: (payload.primaryCta as { href?: string })?.href ?? "/contact",
                },
              })
            }
          />
          <input
            placeholder="Primary CTA link"
            className={inputClass}
            value={String((payload.primaryCta as { href?: string })?.href ?? "")}
            onChange={(e) =>
              updatePayload({
                primaryCta: {
                  ...((payload.primaryCta as object) ?? {}),
                  href: e.target.value,
                  label: (payload.primaryCta as { label?: string })?.label ?? "Enquire",
                },
              })
            }
          />
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={payload.showSecondaryCta !== false}
            onChange={(e) => updatePayload({ showSecondaryCta: e.target.checked })}
          />
          Show secondary CTA
        </label>
        {payload.showSecondaryCta !== false ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              placeholder="Secondary CTA label"
              className={inputClass}
              value={String((payload.secondaryCta as { label?: string })?.label ?? "")}
              onChange={(e) =>
                updatePayload({
                  secondaryCta: {
                    ...((payload.secondaryCta as object) ?? {}),
                    label: e.target.value,
                    href: (payload.secondaryCta as { href?: string })?.href ?? "/events",
                  },
                })
              }
            />
            <input
              placeholder="Secondary CTA link"
              className={inputClass}
              value={String((payload.secondaryCta as { href?: string })?.href ?? "")}
              onChange={(e) =>
                updatePayload({
                  secondaryCta: {
                    ...((payload.secondaryCta as object) ?? {}),
                    href: e.target.value,
                    label: (payload.secondaryCta as { label?: string })?.label ?? "View sessions",
                  },
                })
              }
            />
          </div>
        ) : null}
      </div>
    );
  }

  if (type === "GALLERY") {
    const images = (payload.images as { url: string; alt: string; title?: string }[]) ?? [];
    return (
      <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-800">Gallery images</p>
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={Boolean(payload.carousel)}
            onChange={(e) => updatePayload({ carousel: e.target.checked })}
          />
          Animated carousel (instead of grid)
        </label>
        {images.map((img, index) => (
          <div key={index} className="rounded-xl border border-slate-200 p-3 space-y-3">
            <ImageUploadField
              label={`Image ${index + 1}`}
              section="pages"
              value={img.url}
              onChange={(url) => {
                const next = [...images];
                next[index] = { ...next[index], url };
                updatePayload({ images: next });
              }}
            />
            <input
              placeholder="Alt text"
              value={img.alt}
              onChange={(e) => {
                const next = [...images];
                next[index] = { ...next[index], alt: e.target.value };
                updatePayload({ images: next });
              }}
              className={inputClass}
            />
            <input
              placeholder="Title (optional, shown on immersive galleries)"
              value={img.title ?? ""}
              onChange={(e) => {
                const next = [...images];
                next[index] = { ...next[index], title: e.target.value };
                updatePayload({ images: next });
              }}
              className={inputClass}
            />
            <button
              type="button"
              className="text-xs text-red-600"
              onClick={() => updatePayload({ images: images.filter((_, i) => i !== index) })}
            >
              Remove image
            </button>
          </div>
        ))}
        <button
          type="button"
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
          onClick={() => updatePayload({ images: [...images, { url: "", alt: "" }] })}
        >
          + Add image
        </button>
      </div>
    );
  }

  if (type === "TESTIMONIALS") {
    const items = (payload.items as Record<string, string>[]) ?? [];

    function updateTestimonialItem(index: number, patch: Record<string, string>) {
      updatePayload((current) => {
        const currentItems = Array.isArray(current.items)
          ? [...(current.items as Record<string, string>[])]
          : [];
        while (currentItems.length <= index) {
          currentItems.push({ quote: "", name: "", role: "", imageUrl: "" });
        }
        currentItems[index] = { ...currentItems[index], ...patch };
        return { items: currentItems };
      });
    }

    return (
      <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-800">Testimonial items (text, image, or both)</p>
        <p className="text-xs text-slate-500">
          Each item needs a quote, photo, name, or role. Empty rows are not saved.
        </p>
        {items.map((item, index) => (
          <div key={index} className="space-y-3 rounded-xl border border-slate-200 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Testimonial {index + 1}
            </p>
            <textarea
              placeholder="Quote (optional)"
              value={item.quote ?? ""}
              rows={2}
              className={inputClass}
              onChange={(e) => updateTestimonialItem(index, { quote: e.target.value })}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                placeholder="Name"
                value={item.name ?? ""}
                className={inputClass}
                onChange={(e) => updateTestimonialItem(index, { name: e.target.value })}
              />
              <input
                placeholder="Role"
                value={item.role ?? ""}
                className={inputClass}
                onChange={(e) => updateTestimonialItem(index, { role: e.target.value })}
              />
            </div>
            <ImageUploadField
              label="Photo (optional)"
              section="pages"
              value={item.imageUrl ?? ""}
              onChange={(url) => updateTestimonialItem(index, { imageUrl: url })}
            />
            <input
              placeholder="Photo alt text (optional)"
              value={item.imageAlt ?? ""}
              className={inputClass}
              onChange={(e) => updateTestimonialItem(index, { imageAlt: e.target.value })}
            />
            <button
              type="button"
              className="text-xs text-red-600"
              onClick={() =>
                updatePayload((current) => {
                  const currentItems = Array.isArray(current.items)
                    ? (current.items as Record<string, string>[])
                    : [];
                  return { items: currentItems.filter((_, i) => i !== index) };
                })
              }
            >
              Remove testimonial
            </button>
          </div>
        ))}
        <button
          type="button"
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
          onClick={() =>
            updatePayload((current) => {
              const currentItems = Array.isArray(current.items)
                ? [...(current.items as Record<string, string>[])]
                : [];
              return {
                items: [...currentItems, { quote: "", name: "", role: "", imageUrl: "" }],
              };
            })
          }
        >
          + Add testimonial
        </button>
      </div>
    );
  }

  if (type === "EVENTS") {
    const selectedCategories = Array.isArray(payload.categories)
      ? (payload.categories as string[])
      : [];

    function toggleCategory(value: string) {
      const next = selectedCategories.includes(value)
        ? selectedCategories.filter((c) => c !== value)
        : [...selectedCategories, value];
      updatePayload({ categories: next.length ? next : undefined });
    }

    return (
      <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-800">Events display</p>
        <label className="block text-sm font-medium text-slate-700">
          Show
          <select
            className={inputClass}
            value={String(payload.eventKind ?? "all")}
            onChange={(e) => updatePayload({ eventKind: e.target.value })}
          >
            <option value="all">All matching events</option>
            <option value="sessions">Sessions / workshops only</option>
            <option value="retreats">Retreats &amp; tours only</option>
          </select>
        </label>
        <fieldset>
          <legend className="text-sm font-medium text-slate-700">Event categories</legend>
          <p className="mt-1 text-xs text-slate-500">
            Leave none selected to use the page default. Select one or more to filter.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {EVENT_CATEGORY_OPTIONS.map((option) => {
              const active = selectedCategories.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleCategory(option.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>
        <label className="block text-sm font-medium text-slate-700">
          Max events
          <input
            type="number"
            min={1}
            max={24}
            className={inputClass}
            value={Number(payload.limit ?? 6)}
            onChange={(e) => updatePayload({ limit: Number(e.target.value) })}
          />
        </label>
        <p className="text-xs text-slate-500">
          Retreats show a distinct badge on the public site. Create events under Events with category
          Retreats and Tours.
        </p>
      </div>
    );
  }

  if (type === "CONTACT") {
    return (
      <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-800">Contact / inquiry</p>
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={payload.showForm !== false}
            onChange={(e) => updatePayload({ showForm: e.target.checked })}
          />
          Show inquiry form
        </label>
        <input
          placeholder="Form email subject"
          className={inputClass}
          value={String(payload.formSubject ?? "")}
          onChange={(e) => updatePayload({ formSubject: e.target.value })}
        />
        <input
          placeholder="CTA button label"
          className={inputClass}
          value={String(payload.ctaLabel ?? "")}
          onChange={(e) => updatePayload({ ctaLabel: e.target.value })}
        />
        <input
          placeholder="CTA link (e.g. /contact)"
          className={inputClass}
          value={String(payload.ctaHref ?? "")}
          onChange={(e) => updatePayload({ ctaHref: e.target.value })}
        />
      </div>
    );
  }

  if (type === "CUSTOM_TEXT") {
    return (
      <CustomTextPayloadEditor
        pageType={pageType}
        payload={payload}
        onChange={(nextPayload) =>
          onChange({
            ...draft,
            payload: nextPayload,
          })
        }
      />
    );
  }

  if (type === "IMAGE_TEXT" || type === "DYNAMIC_IMAGE_TEXT") {
    const items = Array.isArray(payload.items) ? (payload.items as { id: string; imageUrl: string; imageAlt?: string; content: string; contentJa?: string }[]) : [];
    const scrollBehavior = (payload.scrollBehavior as string) ?? "sticky";
    const layoutDirection = (payload.layoutDirection as string) ?? "image-left";
    const imageHeight = (payload.imageHeight as string) ?? "medium";
    const imageFit = (payload.imageFit as string) ?? "cover";

    function updateItem(index: number, patch: Record<string, unknown>) {
      updatePayload((current) => {
        const curItems = Array.isArray(current.items) ? [...(current.items as Record<string, unknown>[])] : [];
        curItems[index] = { ...(curItems[index] as Record<string, unknown>), ...patch };
        return { items: curItems };
      });
    }

    function moveItem(index: number, dir: "up" | "down") {
      const target = dir === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= items.length) return;
      updatePayload((current) => {
        const curItems = Array.isArray(current.items) ? [...(current.items as Record<string, unknown>[])] : [];
        const copy = [...curItems];
        const [moved] = copy.splice(index, 1);
        copy.splice(target, 0, moved);
        return { items: copy };
      });
    }

    return (
      <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
        <div>
          <p className="text-sm font-semibold text-slate-800">Image + Text</p>
          <p className="mt-1 text-xs text-slate-500">Multiple image/text items with optional sticky-image scrolling. Image left/right and sticky behavior are configurable.</p>
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
                  <button type="button" disabled={index === 0} onClick={() => moveItem(index, "up")} className={iconBtnClass} title="Move up" aria-label={`Move item ${index + 1} up`}>↑</button>
                  <button type="button" disabled={index === items.length - 1} onClick={() => moveItem(index, "down")} className={iconBtnClass} title="Move down" aria-label={`Move item ${index + 1} down`}>↓</button>
                  <button
                    type="button"
                    className="cursor-pointer text-xs text-red-600 hover:text-red-700 hover:underline"
                    onClick={() =>
                      updatePayload((current) => {
                        const curItems = Array.isArray(current.items) ? [...(current.items as Record<string, unknown>[])] : [];
                        return { items: curItems.filter((_, i) => i !== index) };
                      })
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>

              <ImageUploadField
                label={`Image ${index + 1}`}
                section="pages"
                value={item.imageUrl ?? ""}
                onChange={(url) => updateItem(index, { imageUrl: url })}
              />
              <input
                placeholder="Image alt text"
                value={item.imageAlt ?? ""}
                className={inputClass}
                onChange={(e) => updateItem(index, { imageAlt: e.target.value })}
              />
              <RichTextEditor
                label={`Text — English (Item ${index + 1})`}
                value={item.content ?? ""}
                onChange={(html) => updateItem(index, { content: html })}
                placeholder="English rich text…"
                minHeight={120}
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-900 hover:bg-sky-100 disabled:opacity-50"
                  onClick={async () => {
                    try {
                      const ja = await translateHtmlViaApi(item.content ?? "");
                      updateItem(index, { contentJa: ja });
                    } catch (e) {
                      alert(e instanceof Error ? e.message : "Translation failed. Check GEMINI_API_KEY and TRANSLATE_MODEL.");
                    }
                  }}
                  title="Generate Japanese from English via Gemini (preserves formatting)"
                >
                  Translate / Regenerate Japanese
                </button>
              </div>
              <RichTextEditor
                label={`Text — Japanese  (Item ${index + 1}) — machine translated, editable`}
                value={item.contentJa ?? ""}
                onChange={(html) => updateItem(index, { contentJa: html })}
                placeholder="日本語リッチテキスト…（自動生成後に編集可）"
                minHeight={120}
              />
              <p className="text-[11px] text-slate-500">Japanese is stored as machine translation (MACHINE). Editing marks it reviewed; regenerate overwrites.</p>
            </div>
          ))}
          <button
            type="button"
            className="cursor-pointer rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            onClick={() => {
              const newId = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
              updatePayload((current) => {
                const curItems = Array.isArray(current.items) ? [...(current.items as Record<string, unknown>[])] : [];
                return {
                  items: [...curItems, { id: newId, imageUrl: "", imageAlt: "", content: "<p></p>", contentJa: "" }],
                };
              });
            }}
          >
            + Add item
          </button>
          {items.length === 0 ? <p className="text-xs text-slate-500">Add at least one image + text pair. Each item can have long rich text; sticky keeps image visible while text scrolls.</p> : null}
        </div>
      </div>
    );
  }

  if (type === "BUTTON") {
    const label = String(payload.label ?? "");
    const labelJa = String(payload.labelJa ?? "");
    const href = String(payload.href ?? "/contact");
    const supportingText = String(payload.supportingText ?? "");
    const supportingTextJa = String(payload.supportingTextJa ?? "");
    const variant = String(payload.variant ?? "primary");
    const size = String(payload.size ?? "md");
    const alignment = String(payload.alignment ?? "center");
    const targetBlank = Boolean(payload.targetBlank);
    return (
      <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-800">Button / Call to action</p>
        <p className="text-xs text-slate-500">Reusable CTA elsewhere — uses existing Button component. Supports internal (/contact) or https URL.</p>
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
          Button label — Japanese (auto-translated, editable)
          <input className={inputClass} value={labelJa} onChange={(e) => updatePayload({ labelJa: e.target.value })} placeholder="日本語ボタン" />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Link (internal /contact or https://…)
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
        <RichTextEditor label="Supporting text — English (optional)" value={supportingText} onChange={(html) => updatePayload({ supportingText: html })} placeholder="Optional heading/supporting prose" minHeight={80} />
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
        <RichTextEditor label="Supporting text — Japanese (optional, auto)" value={supportingTextJa} onChange={(html) => updatePayload({ supportingTextJa: html })} placeholder="日本語サポートテキスト" minHeight={80} />
      </div>
    );
  }

  return null;
}
