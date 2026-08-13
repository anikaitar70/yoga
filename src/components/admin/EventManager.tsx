"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore, type FormEvent } from "react";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { EventDetailEditorPanel } from "@/components/admin/EventDetailEditorPanel";
import { EventDetailPanel } from "@/components/content/EventDetailPanel";
import { UPLOAD_FILE_HINT } from "@/lib/upload-limits";
import { adminFetch, parseAdminJsonResponse } from "@/lib/admin-fetch";
import { EVENT_CATEGORY_OPTIONS } from "@/lib/event-categories";
import type { AdminEvent, EventCategory } from "@/lib/admin-types";
import {
  emptyEventDetail,
  eventDetailHasReadableContent,
  normalizeEventDetailConfig,
  parseEventDetail,
  sanitizeEventDetailForSave,
  type EventDetailConfig,
} from "@/lib/event-detail";
import { eventCategoryToSlug } from "@/lib/event-categories";
import type { Event } from "@/content/types";
import {
  SeoFieldsEditor,
  emptySeoFormState,
  seoFormToPayload,
  seoFromRecord,
  type SeoFormState,
} from "@/components/admin/SeoFieldsEditor";
import { LocaleEditorTabs, type EditorLocale } from "@/components/admin/LocaleEditorTabs";
import { MachineTranslationNote } from "@/components/admin/LocaleContentEditor";
import {
  compactEventJaLocale,
  parseEventJaLocale,
  type EventJaLocale,
} from "@/lib/event-locale";

interface EventManagerProps {
  initialEvents: AdminEvent[];
}

type EventFormState = Omit<AdminEvent, "id">;

const emptyEvent: EventFormState = {
  title: "",
  slug: "",
  description: "",
  location: "",
  startsAt: new Date().toISOString().slice(0, 16),
  endsAt: "",
  imageUrl: "",
  imageAlt: "",
  externalUrl: "",
  externalLinkLabel: "",
  eventDetail: emptyEventDetail(),
  price: null,
  category: "YOGA",
  isFeatured: false,
  published: true,
  sortOrder: 0,
  isSpecialEvent: false,
};

function toDateTimeLocalValue(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const timezoneOffsetInMs = parsed.getTimezoneOffset() * 60 * 1000;
  return new Date(parsed.getTime() - timezoneOffsetInMs).toISOString().slice(0, 16);
}

function toIsoDateTime(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toISOString();
}

function formatEventDateTime(value: string, useLocalTime: boolean) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZone: useLocalTime ? undefined : "UTC",
  });
}

function normalizeAdminEvent(raw: Record<string, unknown>): AdminEvent {
  const category = String(raw.category ?? "YOGA") as EventCategory;
  return {
    id: String(raw.id),
    title: String(raw.title),
    slug: String(raw.slug),
    description: String(raw.description),
    location: String(raw.location),
    startsAt:
      raw.startsAt instanceof Date
        ? raw.startsAt.toISOString()
        : String(raw.startsAt),
    endsAt: raw.endsAt
      ? raw.endsAt instanceof Date
        ? raw.endsAt.toISOString()
        : String(raw.endsAt)
      : null,
    imageUrl: raw.imageUrl ? String(raw.imageUrl) : null,
    imageAlt: raw.imageAlt ? String(raw.imageAlt) : null,
    externalUrl: raw.externalUrl ? String(raw.externalUrl) : null,
    externalLinkLabel: raw.externalLinkLabel ? String(raw.externalLinkLabel) : null,
    eventDetail: normalizeEventDetailConfig(parseEventDetail(raw.eventDetail)),
    sortOrder: typeof raw.sortOrder === "number" ? raw.sortOrder : Number(raw.sortOrder ?? 0),
    price: raw.price != null ? Number(raw.price) : null,
    category,
    isFeatured: Boolean(raw.isFeatured),
    published: Boolean(raw.published),
    seoTitle: raw.seoTitle ? String(raw.seoTitle) : null,
    metaDescription: raw.metaDescription ? String(raw.metaDescription) : null,
    ogImageUrl: raw.ogImageUrl ? String(raw.ogImageUrl) : null,
    canonicalUrlOverride: raw.canonicalUrlOverride ? String(raw.canonicalUrlOverride) : null,
    focusKeywords: Array.isArray(raw.focusKeywords) ? raw.focusKeywords.map(String) : [],
    jaTranslationStatus:
      raw.jaTranslationStatus === "HUMAN_REVIEWED" ? "HUMAN_REVIEWED" : "MACHINE",
    jaLocale: parseEventJaLocale(raw.jaLocale),
    isSpecialEvent: Boolean(raw.isSpecialEvent),
  };
}

function toPreviewEvent(formState: EventFormState): Event {
  const detail = sanitizeEventDetailForSave(formState.eventDetail) ?? emptyEventDetail();
  return {
    id: "preview",
    slug: formState.slug || "preview",
    title: formState.title || "Event preview",
    date: toIsoDateTime(formState.startsAt || new Date().toISOString()),
    endDate: formState.endsAt ? toIsoDateTime(formState.endsAt) : undefined,
    location: formState.location || "",
    price: formState.price != null ? String(formState.price) : "",
    description: formState.description || "",
    category: eventCategoryToSlug(formState.category) as Event["category"],
    imageUrl: formState.imageUrl || undefined,
    imageAlt: formState.imageAlt || formState.title || undefined,
    isFeatured: formState.isFeatured,
    externalUrl: formState.externalUrl || undefined,
    externalLinkLabel: formState.externalLinkLabel?.trim() || undefined,
    eventDetail: { ...detail, enabled: true },
  };
}

function compareEventOrder(a: AdminEvent, b: AdminEvent) {
  const orderDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  if (orderDiff !== 0) return orderDiff;
  return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
}

function eventStatusBadges(eventItem: AdminEvent) {
  const detail = eventItem.eventDetail;
  const hasExternal = Boolean(eventItem.externalUrl?.trim());
  const hasReadMore = eventDetailHasReadableContent(detail, "en") || eventDetailHasReadableContent(detail, "ja");
  const sectionCount = Math.max(detail?.en?.sections?.length ?? 0, detail?.ja?.sections?.length ?? 0);
  const hasRegistration =
    Boolean(detail?.en?.registration?.enabled && detail.en.registration.googleFormUrl?.trim()) ||
    Boolean(detail?.ja?.registration?.enabled && detail.ja.registration.googleFormUrl?.trim());

  return { hasExternal, hasReadMore, sectionCount, hasRegistration };
}

export default function EventManager({ initialEvents }: EventManagerProps) {
  const [events, setEvents] = useState(initialEvents.map((event) => normalizeAdminEvent(event as unknown as Record<string, unknown>)));
  const [editingEvent, setEditingEvent] = useState<AdminEvent | null>(null);
  const [formState, setFormState] = useState<EventFormState>(emptyEvent);
  const [seoState, setSeoState] = useState<SeoFormState>(emptySeoFormState);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLocale, setPreviewLocale] = useState<"en" | "ja">("en");
  const [cardLocale, setCardLocale] = useState<EditorLocale>("en");
  const [jaLocale, setJaLocale] = useState<EventJaLocale>({});
  const [reorderBusy, setReorderBusy] = useState(false);
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const sortedEvents = useMemo(
    () => [...events].sort(compareEventOrder),
    [events],
  );

  function resetForm() {
    setEditingEvent(null);
    setFormState(emptyEvent);
    setJaLocale({});
    setCardLocale("en");
    setSeoState(emptySeoFormState);
    setFeedback(null);
    setErrorDetails([]);
    setPreviewOpen(false);
  }

  function updateEventDetail(eventDetail: EventDetailConfig) {
    setFormState((current) => ({ ...current, eventDetail }));
  }

  async function submitEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setFeedback(null);
    setErrorDetails([]);

    try {
      const eventDetail = sanitizeEventDetailForSave(formState.eventDetail);
      const payload = {
        ...formState,
        ...seoFormToPayload({ ...seoState, imageAlt: seoState.imageAlt }),
        startsAt: toIsoDateTime(formState.startsAt),
        imageUrl: formState.imageUrl || null,
        imageAlt: seoState.imageAlt || formState.imageAlt || undefined,
        externalUrl: formState.externalUrl?.trim() || null,
        externalLinkLabel: formState.externalLinkLabel?.trim() || null,
        eventDetail,
        jaLocale: compactEventJaLocale(jaLocale),
        isSpecialEvent: formState.isSpecialEvent,
        endsAt: formState.endsAt ? toIsoDateTime(formState.endsAt) : null,
        price: formState.price === null || formState.price === undefined ? undefined : Number(formState.price),
      };

      const method = editingEvent ? "PUT" : "POST";
      const url = editingEvent ? `/api/events/${editingEvent.id}` : "/api/events";
      const response = await adminFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      const parsed = await parseAdminJsonResponse<Record<string, unknown> & { error?: string; details?: string[] }>(
        response,
      );

      if (!parsed.ok) {
        setFeedback(parsed.error);
        return;
      }

      if (!response.ok) {
        const message = String(parsed.data.error || "Unable to save event.");
        const details = Array.isArray(parsed.data.details) ? parsed.data.details.map(String) : [];
        setFeedback(message);
        setErrorDetails(details);
        return;
      }

      const savedEvent = normalizeAdminEvent(parsed.data);
      setEvents((current) => {
        const updated = current.filter((item) => item.id !== savedEvent.id);
        updated.push(savedEvent);
        return updated.sort(compareEventOrder);
      });

      if (savedEvent.isSpecialEvent) {
        setFeedback(
          "Event saved. Open Special events to add page sections and publish the dedicated URL.",
        );
        setShowForm(false);
        setEditingEvent(null);
        return;
      }

      resetForm();
      setShowForm(false);
    } catch {
      setFeedback("Unable to save event.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this event?")) {
      return;
    }

    setBusy(true);
    try {
      const response = await adminFetch(`/api/events/${id}`, { method: "DELETE" });
      const parsed = await parseAdminJsonResponse(response);
      if (!parsed.ok || !response.ok) {
        setFeedback(parsed.ok ? "Unable to delete event." : parsed.error);
        return;
      }
      setEvents((current) => current.filter((event) => event.id !== id));
    } catch {
      setFeedback("Unable to delete event.");
    } finally {
      setBusy(false);
    }
  }

  async function persistReorder(orderedIds: string[]) {
    setReorderBusy(true);
    setFeedback(null);
    try {
      const response = await adminFetch("/api/events/reorder", {
        method: "PATCH",
        body: JSON.stringify({ orderedIds }),
      });
      const parsed = await parseAdminJsonResponse<Record<string, unknown>[]>(response);
      if (!parsed.ok || !response.ok) {
        setFeedback(parsed.ok ? "Unable to reorder events." : parsed.error);
        return;
      }
      const reordered = parsed.data.map((item) => normalizeAdminEvent(item));
      setEvents(reordered.sort(compareEventOrder));
    } catch {
      setFeedback("Unable to reorder events.");
    } finally {
      setReorderBusy(false);
    }
  }

  async function handleReorder(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sortedEvents.length) return;
    const next = [...sortedEvents];
    [next[index], next[target]] = [next[target], next[index]];
    await persistReorder(next.map((event) => event.id));
  }

  function handleEdit(eventData: AdminEvent) {
    setEditingEvent(eventData);
    setFormState({
      title: eventData.title,
      slug: eventData.slug,
      description: eventData.description,
      location: eventData.location,
      startsAt: toDateTimeLocalValue(eventData.startsAt),
      endsAt: eventData.endsAt ? toDateTimeLocalValue(eventData.endsAt) : "",
      imageUrl: eventData.imageUrl ?? "",
      imageAlt: eventData.imageAlt ?? "",
      externalUrl: eventData.externalUrl ?? "",
      externalLinkLabel: eventData.externalLinkLabel ?? "",
      eventDetail: normalizeEventDetailConfig(eventData.eventDetail ?? emptyEventDetail()),
      price: eventData.price ?? null,
      category: eventData.category,
      isFeatured: eventData.isFeatured,
      published: eventData.published,
      sortOrder: eventData.sortOrder ?? 0,
      isSpecialEvent: eventData.isSpecialEvent ?? false,
    });
    setSeoState(seoFromRecord(eventData as unknown as Record<string, unknown>));
    setJaLocale(parseEventJaLocale(eventData.jaLocale) ?? {});
    setCardLocale("en");
    setShowForm(true);
    setFeedback(null);
    setErrorDetails([]);
    setPreviewOpen(false);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Manage events</h2>
          <p className="mt-1 text-sm text-slate-600">
            Create, edit, and remove studio events. Configure external links and Read More panels per event.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowForm((value) => !value);
          }}
          className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          {showForm ? "Hide form" : "Create event"}
        </button>
      </div>

      {showForm ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">{editingEvent ? "Edit event" : "New event"}</h3>
          <form className="mt-6 space-y-8" onSubmit={submitEvent}>
            <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Basic event information</h4>
                  <p className="mt-1 text-xs text-slate-500">Title, schedule, location, card image, and summary.</p>
                </div>
                <LocaleEditorTabs activeLocale={cardLocale} onChange={setCardLocale} />
              </div>
              <MachineTranslationNote />
              {cardLocale === "en" ? (
                <>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Title
                  <input
                    value={formState.title}
                    onChange={(event) => setFormState({ ...formState, title: event.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Slug
                  <input
                    value={formState.slug}
                    onChange={(event) => setFormState({ ...formState, slug: event.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Location
                  <input
                    value={formState.location}
                    onChange={(event) => setFormState({ ...formState, location: event.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Category
                  <select
                    value={formState.category}
                    onChange={(event) =>
                      setFormState({ ...formState, category: event.target.value as EventCategory })
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                  >
                    {EVENT_CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Price
                  <input
                    value={formState.price ?? ""}
                    onChange={(event) =>
                      setFormState({
                        ...formState,
                        price: event.target.value === "" ? null : Number(event.target.value),
                      })
                    }
                    type="number"
                    min="0"
                    step="0.01"
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Starts at
                    <input
                      value={formState.startsAt}
                      onChange={(event) => setFormState({ ...formState, startsAt: event.target.value })}
                      type="datetime-local"
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    Ends at
                    <input
                      value={formState.endsAt ?? ""}
                      onChange={(event) => setFormState({ ...formState, endsAt: event.target.value })}
                      type="datetime-local"
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                    />
                  </label>
                </div>
              </div>

              <ImageUploadField
                label="Event image"
                section="events"
                value={formState.imageUrl ?? ""}
                onChange={(url) => setFormState({ ...formState, imageUrl: url })}
                hint={`${UPLOAD_FILE_HINT} Upload replaces the current image.`}
              />

              <label className="block text-sm font-medium text-slate-700">
                Description
                <textarea
                  value={formState.description}
                  onChange={(event) => setFormState({ ...formState, description: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                  rows={4}
                />
              </label>
                </>
              ) : (
                <>
              <label className="block text-sm font-medium text-slate-700">
                Title (日本語)
                <input
                  value={jaLocale.title ?? ""}
                  onChange={(event) => setJaLocale({ ...jaLocale, title: event.target.value })}
                  placeholder={formState.title}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Location (日本語)
                <input
                  value={jaLocale.location ?? ""}
                  onChange={(event) => setJaLocale({ ...jaLocale, location: event.target.value })}
                  placeholder={formState.location}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Description (日本語)
                <textarea
                  value={jaLocale.description ?? ""}
                  onChange={(event) => setJaLocale({ ...jaLocale, description: event.target.value })}
                  placeholder={formState.description}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                  rows={4}
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                External link button text (日本語)
                <input
                  value={jaLocale.externalLinkLabel ?? ""}
                  onChange={(event) => setJaLocale({ ...jaLocale, externalLinkLabel: event.target.value })}
                  placeholder={formState.externalLinkLabel || "Visit event page"}
                  maxLength={48}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>
                </>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={formState.isFeatured}
                    onChange={(event) => setFormState({ ...formState, isFeatured: event.target.checked })}
                    className="h-5 w-5 rounded border-slate-300 text-slate-900"
                  />
                  Featured
                </label>
                <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={formState.published}
                    onChange={(event) => setFormState({ ...formState, published: event.target.checked })}
                    className="h-5 w-5 rounded border-slate-300 text-slate-900"
                  />
                  Published
                </label>
              </div>
            </section>

            <section className="space-y-4 rounded-2xl border border-violet-200 bg-violet-50/60 p-5">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Dedicated special event page</h4>
                <p className="mt-1 text-xs text-slate-600">
                  For retreats, workshops, and major events that need their own shareable URL with CMS sections
                  and a table of contents. This is separate from the Read More panel above.
                </p>
              </div>
              <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={Boolean(formState.isSpecialEvent)}
                  onChange={(event) => setFormState({ ...formState, isSpecialEvent: event.target.checked })}
                  className="h-5 w-5 rounded border-slate-300 text-slate-900"
                />
                Enable dedicated page for this event
              </label>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <Link
                  href="/admin/special-events"
                  className="font-semibold text-violet-800 underline hover:text-violet-950"
                >
                  Open Special events admin
                </Link>
                {editingEvent && formState.isSpecialEvent ? (
                  <Link
                    href={`/admin/special-events/${editingEvent.id}`}
                    className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    Edit page sections
                  </Link>
                ) : (
                  <span className="text-xs text-slate-500">
                    {formState.isSpecialEvent
                      ? "Save this event first, then use Special events admin to add sections."
                      : "Or create from Special events admin directly."}
                  </span>
                )}
              </div>
            </section>

            <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">External event link</h4>
                <p className="mt-1 text-xs text-slate-500">
                  Main card click opens this hosted event page in a new tab. Leave blank to keep the contact CTA.
                </p>
              </div>
              <label className="block text-sm font-medium text-slate-700">
                External event URL (HTTPS)
                <input
                  value={formState.externalUrl ?? ""}
                  onChange={(event) => setFormState({ ...formState, externalUrl: event.target.value })}
                  placeholder="https://example.com/event"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                External link button text
                <input
                  value={formState.externalLinkLabel ?? ""}
                  onChange={(event) => setFormState({ ...formState, externalLinkLabel: event.target.value })}
                  placeholder="Visit event page"
                  maxLength={48}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
                <span className="mt-1 block text-xs text-slate-500">
                  Text displayed on the button that opens the external event page. Leave blank for &quot;Visit event
                  page&quot;.
                </span>
              </label>
            </section>

            <EventDetailEditorPanel
              value={formState.eventDetail ?? emptyEventDetail()}
              onChange={updateEventDetail}
              onPreview={() => setPreviewOpen(true)}
              previewLocale={previewLocale}
              onPreviewLocaleChange={setPreviewLocale}
            />

            <SeoFieldsEditor
              value={seoState}
              onChange={setSeoState}
              showImageAlt
              imageAltLabel="Event image alt text"
              context="event"
            />

            {feedback ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <p className="font-semibold">{feedback}</p>
                {errorDetails.length ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-red-700">
                    {errorDetails.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {busy ? "Saving…" : editingEvent ? "Update event" : "Create event"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Event display order</h3>
            <p className="mt-1 text-sm text-slate-600">
              Controls the order events appear on the public events pages and featured sections.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
            {events.length} events
          </span>
        </div>

        <div className="mt-6 space-y-3">
          {sortedEvents.map((eventItem, index) => (
            <div
              key={eventItem.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <h4 className="truncate text-base font-semibold text-slate-900">{eventItem.title}</h4>
                  <p className="mt-1 text-sm text-slate-600">{eventItem.location}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleReorder(index, -1)}
                  disabled={index === 0 || reorderBusy}
                  aria-label={`Move ${eventItem.title} up`}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => handleReorder(index, 1)}
                  disabled={index === sortedEvents.length - 1 || reorderBusy}
                  aria-label={`Move ${eventItem.title} down`}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"
                >
                  ↓
                </button>
              </div>
            </div>
          ))}
          {events.length === 0 ? <p className="text-sm text-slate-600">There are no events yet.</p> : null}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Event list</h3>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
            {events.length} events
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {sortedEvents.map((eventItem) => (
            <div key={eventItem.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-slate-500" suppressHydrationWarning>
                    {formatEventDateTime(eventItem.startsAt, isHydrated)}
                  </p>
                  <h4 className="text-lg font-semibold text-slate-900">{eventItem.title}</h4>
                  <p className="mt-2 text-sm text-slate-600">{eventItem.location}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(eventItem)}
                    className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(eventItem.id)}
                    className="rounded-2xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-full bg-slate-200 px-2.5 py-1 text-slate-700">
                  {eventItem.published ? "Published" : "Draft"}
                </span>
                <span className="rounded-full bg-slate-200 px-2.5 py-1 text-slate-700">
                  {eventItem.isFeatured ? "Featured" : "Standard"}
                </span>
                {(() => {
                  const status = eventStatusBadges(eventItem);
                  return (
                    <>
                      <span
                        className={`rounded-full px-2.5 py-1 ${
                          status.hasExternal
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {status.hasExternal ? "External link" : "No external link"}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 ${
                          status.hasReadMore
                            ? "bg-amber-100 text-amber-900"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {status.hasReadMore
                          ? `Read More (${status.sectionCount} section${status.sectionCount === 1 ? "" : "s"})`
                          : "Read More off"}
                      </span>
                      {status.hasRegistration ? (
                        <span className="rounded-full bg-sky-100 px-2.5 py-1 text-sky-900">
                          Google Form CTA
                        </span>
                      ) : null}
                    </>
                  );
                })()}
                {eventItem.price !== null && eventItem.price !== undefined ? (
                  <span className="rounded-full bg-slate-200 px-2.5 py-1 text-slate-700">
                    ${eventItem.price.toFixed(2)}
                  </span>
                ) : null}
              </div>
            </div>
          ))}
          {events.length === 0 ? <p className="text-sm text-slate-600">There are no events yet.</p> : null}
        </div>
      </section>

      <EventDetailPanel
        event={toPreviewEvent(formState)}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        locale={previewLocale}
        preview
        previewLocale={previewLocale}
      />
    </div>
  );
}
