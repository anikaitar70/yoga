"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { adminDeleteRequest, adminJsonRequest } from "@/lib/admin-fetch";
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
  layoutPatchWithImageAspect,
  type SectionLayoutSettings,
} from "@/lib/section-layout";
import Link from "next/link";
import { CustomTextPayloadEditor } from "@/components/admin/CustomTextPayloadEditor";
import { paragraphsToContent } from "@/lib/page-section-types";

type Props = {
  initialByPage: Record<PageType, AdminPageSection[]>;
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

export default function PageSectionsManager({ initialByPage }: Props) {
  const router = useRouter();
  const [pageType, setPageType] = useState<PageType>("YOGA");
  const [sections, setSections] = useState<AdminPageSection[]>(initialByPage.YOGA ?? []);
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
  const [message, setMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const initialByPageRef = useRef(initialByPage);
  initialByPageRef.current = initialByPage;

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
    let payload = section.payload
      ? { ...section.payload }
      : defaultPayloadForSectionType(section.sectionType, section.pageType);
    if (section.sectionType === "TESTIMONIALS") {
      payload = ensureTestimonialsPayload(payload as Record<string, unknown>);
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

    return payload;
  }

  function buildUpdatePayload(section: AdminPageSection) {
    const imageUrl = section.imageUrl?.trim();
    const isCustomText = section.sectionType === "CUSTOM_TEXT";
    const customParagraphs = isCustomText
      ? ((section.payload?.paragraphs as string[] | undefined) ?? [])
      : [];
    return {
      title: section.title ?? "",
      subtitle: section.subtitle ?? "",
      content: isCustomText ? paragraphsToContent(customParagraphs) : (section.content ?? ""),
      imageUrl: isCustomText ? null : imageUrl ? imageUrl : null,
      imageAlt: isCustomText ? "" : (section.imageAlt ?? ""),
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
              {PAGE_SECTION_TYPES.map((type) => (
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

      {draft ? (
        <section
          ref={formRef}
          className="scroll-mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-900/5"
        >
          <h3 className="text-lg font-semibold text-slate-900">Edit section</h3>
          <p className="mt-1 text-sm text-slate-600">
            {PAGE_SECTION_TYPE_LABELS[draft.sectionType as PageSectionType] ?? draft.sectionType}
            {activeId ? ` · ${sections.find((s) => s.id === activeId)?.title || "Untitled"}` : ""}
          </p>
          <div className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Title
              <input
                ref={titleInputRef}
                value={draft.title ?? ""}
                onChange={(e) => patchDraft({ title: e.target.value })}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Subtitle / eyebrow
              <input
                value={draft.subtitle ?? ""}
                onChange={(e) => patchDraft({ subtitle: e.target.value })}
                className={inputClass}
              />
            </label>
            {draft.sectionType === "CUSTOM_TEXT" ? null : draft.sectionType !== "TESTIMONIALS" ? (
              <>
                <label className="block text-sm font-medium text-slate-700">
                  Body text (paragraphs separated by blank lines)
                  <textarea
                    value={draft.content ?? ""}
                    onChange={(e) => patchDraft({ content: e.target.value })}
                    rows={5}
                    className={inputClass}
                  />
                </label>
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
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 disabled:opacity-60"
              >
                {busy ? "Saving…" : "Save draft"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => saveSection(true)}
                className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
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

  return null;
}
