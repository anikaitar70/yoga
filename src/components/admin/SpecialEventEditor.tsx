"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { HelpIcon } from "@/components/help/HelpIcon";
import { LocaleEditorTabs, type EditorLocale } from "@/components/admin/LocaleEditorTabs";
import { EventPageSectionsManager } from "@/components/admin/EventPageSectionsManager";
import { SpecialEventTocEditor } from "@/components/admin/SpecialEventTocEditor";
import { TestimonialSelector } from "@/components/admin/TestimonialSelector";
import {
  SeoFieldsEditor,
  emptySeoFormState,
  seoFormToPayload,
  seoFromRecord,
  type SeoFormState,
} from "@/components/admin/SeoFieldsEditor";
import { adminFetch, parseAdminJsonResponse } from "@/lib/admin-fetch";
import type { AdminEvent, AdminEventPageSection } from "@/lib/admin-types";
import { EVENT_CATEGORY_OPTIONS } from "@/lib/event-categories";
import { compactEventJaLocale, parseEventJaLocale, type EventJaLocale } from "@/lib/event-locale";
import { parseSpecialEventTocOverride, specialEventPublicPath } from "@/lib/event-page-section";

type Props = {
  event: AdminEvent;
  sections: AdminEventPageSection[];
};

const inputClass =
  "mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

function toDateTimeLocalValue(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  const timezoneOffsetInMs = parsed.getTimezoneOffset() * 60 * 1000;
  return new Date(parsed.getTime() - timezoneOffsetInMs).toISOString().slice(0, 16);
}

function toIsoDateTime(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
}

export function SpecialEventEditor({ event, sections }: Props) {
  const router = useRouter();
  const [formState, setFormState] = useState({
    title: event.title,
    slug: event.slug,
    description: event.description,
    location: event.location,
    startsAt: toDateTimeLocalValue(event.startsAt),
    endsAt: event.endsAt ? toDateTimeLocalValue(event.endsAt) : "",
    imageUrl: event.imageUrl ?? "",
    imageAlt: event.imageAlt ?? "",
    category: event.category,
    published: event.published,
    isFeatured: event.isFeatured,
    price: event.price,
    specialEventCtaLabel: event.specialEventCtaLabel ?? "",
    specialEventCtaUrl: event.specialEventCtaUrl ?? "",
  });
  const [seoState, setSeoState] = useState<SeoFormState>(seoFromRecord(event as unknown as Record<string, unknown>));
  const [cardLocale, setCardLocale] = useState<EditorLocale>("en");
  const [jaLocale, setJaLocale] = useState<EventJaLocale>(parseEventJaLocale(event.jaLocale) ?? {});
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string[]>([]);

  async function saveGeneral(eventForm: FormEvent<HTMLFormElement>) {
    eventForm.preventDefault();
    setBusy(true);
    setFeedback(null);
    setErrorDetails([]);
    try {
      const payload = {
        ...formState,
        ...seoFormToPayload({ ...seoState, imageAlt: seoState.imageAlt }),
        startsAt: toIsoDateTime(formState.startsAt),
        endsAt: formState.endsAt ? toIsoDateTime(formState.endsAt) : null,
        imageUrl: formState.imageUrl || null,
        imageAlt: seoState.imageAlt || formState.imageAlt || undefined,
        price:
          formState.price === null || formState.price === undefined
            ? null
            : Number(formState.price),
        isSpecialEvent: true,
        jaLocale: compactEventJaLocale(jaLocale),
        specialEventCtaLabel: formState.specialEventCtaLabel.trim() || null,
        specialEventCtaUrl: formState.specialEventCtaUrl.trim() || null,
      };
      const response = await adminFetch(`/api/events/${event.id}`, {
        method: "PUT",
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
        const message = String(parsed.data.error || "Unable to save special event.");
        const details = Array.isArray(parsed.data.details) ? parsed.data.details.map(String) : [];
        setFeedback(message);
        setErrorDetails(details);
        return;
      }
      setFeedback("Special event saved.");
      router.refresh();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to save special event.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">
            <Link href="/admin/special-events" className="hover:underline">
              Special events
            </Link>{" "}
            / {event.title}
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">{event.title}</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/admin/special-events/${event.id}/preview`}
            target="_blank"
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Preview (drafts)
          </Link>
          <Link
            href={specialEventPublicPath(event.slug)}
            target="_blank"
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            View live page
          </Link>
        </div>
      </div>

      <form id="special-event-general-form" onSubmit={saveGeneral} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900">
            General
            <HelpIcon sectionId="special-events" title="Special events help" />
          </h2>
          <LocaleEditorTabs activeLocale={cardLocale} onChange={setCardLocale} />
        </div>

        {cardLocale === "en" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Title
              <input className={inputClass} value={formState.title} onChange={(e) => setFormState({ ...formState, title: e.target.value })} required />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Slug
              <input className={inputClass} value={formState.slug} onChange={(e) => setFormState({ ...formState, slug: e.target.value })} required />
            </label>
            <div className="md:col-span-2">
              <RichTextEditor
                label="Summary"
                value={formState.description}
                onChange={(html) => setFormState({ ...formState, description: html })}
                minHeight={140}
              />
            </div>
            <label className="block text-sm font-medium text-slate-700">
              Location
              <input className={inputClass} value={formState.location} onChange={(e) => setFormState({ ...formState, location: e.target.value })} required />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Category
              <select className={inputClass} value={formState.category} onChange={(e) => setFormState({ ...formState, category: e.target.value as AdminEvent["category"] })}>
                {EVENT_CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Starts
              <input type="datetime-local" className={inputClass} value={formState.startsAt} onChange={(e) => setFormState({ ...formState, startsAt: e.target.value })} required />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Ends
              <input type="datetime-local" className={inputClass} value={formState.endsAt} onChange={(e) => setFormState({ ...formState, endsAt: e.target.value })} />
            </label>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Japanese title
              <input className={inputClass} value={jaLocale.title ?? ""} onChange={(e) => setJaLocale({ ...jaLocale, title: e.target.value })} />
            </label>
            <div className="md:col-span-2">
              <RichTextEditor
                label="Japanese summary"
                value={jaLocale.description ?? ""}
                onChange={(html) => setJaLocale({ ...jaLocale, description: html })}
                minHeight={140}
              />
            </div>
            <label className="block text-sm font-medium text-slate-700">
              Japanese location
              <input className={inputClass} value={jaLocale.location ?? ""} onChange={(e) => setJaLocale({ ...jaLocale, location: e.target.value })} />
            </label>
          </div>
        )}

        <ImageUploadField
          label="Hero image"
          section="events"
          value={formState.imageUrl}
          onChange={(imageUrl) => setFormState({ ...formState, imageUrl })}
        />

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={formState.published} onChange={(e) => setFormState({ ...formState, published: e.target.checked })} />
            Published
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={formState.isFeatured} onChange={(e) => setFormState({ ...formState, isFeatured: e.target.checked })} />
            Featured
          </label>
        </div>

        <SeoFieldsEditor value={seoState} onChange={setSeoState} context="event" showImageAlt />

        <section className="space-y-4 rounded-2xl border border-violet-200 bg-violet-50/60 p-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Primary CTA / redirect</h3>
            <p className="mt-1 text-xs text-slate-600">
              Optional button on the dedicated special event page. Separate from the event card external link.
            </p>
          </div>
          <label className="block text-sm font-medium text-slate-700">
            Button text
            <input
              className={inputClass}
              value={formState.specialEventCtaLabel}
              onChange={(e) => setFormState({ ...formState, specialEventCtaLabel: e.target.value })}
              placeholder="Book your retreat"
              maxLength={80}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Button URL
            <input
              className={inputClass}
              value={formState.specialEventCtaUrl}
              onChange={(e) => setFormState({ ...formState, specialEventCtaUrl: e.target.value })}
              placeholder="https://example.com/register or /contact"
            />
            <span className="mt-1 block text-xs text-slate-500">
              HTTPS for external links, or an internal path such as /contact. Leave both blank to hide the button.
            </span>
          </label>
        </section>

        {feedback ? <p className="text-sm text-slate-600">{feedback}</p> : null}
        {errorDetails.length > 0 ? (
          <ul className="text-sm text-red-700">
            {errorDetails.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        ) : null}

        <button type="submit" disabled={busy} className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-50">
          Save general settings
        </button>
      </form>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Page content
          <HelpIcon sectionId="page-sections" title="Page sections help" />
        </h2>
        <p className="mt-1 text-sm text-slate-600">Add, edit, reorder, and publish sections for the dedicated public page.</p>
        <div className="mt-6">
          <EventPageSectionsManager eventId={event.id} initialSections={sections} />
        </div>
      </section>

      <SpecialEventTocEditor
        eventId={event.id}
        sections={sections}
        initialMode={event.specialEventTocMode ?? "AUTOMATIC"}
        initialOverride={parseSpecialEventTocOverride(event.specialEventTocOverride)}
        onSaved={() => router.refresh()}
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Testimonials for this event</h2>
        <p className="mt-1 text-sm text-slate-600">Select existing testimonials to feature on this special event page. Leave empty to use the default global testimonials.</p>
        <div className="mt-4">
          <TestimonialSelector scope="specialEvent" eventId={event.id} onMessage={setFeedback} />
        </div>
      </section>
    </div>
  );
}
