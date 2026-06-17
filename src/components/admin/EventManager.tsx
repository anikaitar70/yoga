"use client";

import { useMemo, useState, type FormEvent } from "react";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { adminFetch, parseAdminJsonResponse } from "@/lib/admin-fetch";
import { EVENT_CATEGORY_OPTIONS } from "@/lib/event-categories";
import type { AdminEvent, EventCategory } from "@/lib/admin-types";

interface EventManagerProps {
  initialEvents: AdminEvent[];
}

const emptyEvent: Omit<AdminEvent, "id"> = {
  title: "",
  slug: "",
  description: "",
  location: "",
  startsAt: new Date().toISOString().slice(0, 16),
  endsAt: "",
  imageUrl: "",
  price: null,
  category: "YOGA",
  isFeatured: false,
  published: true,
};

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
    price: raw.price != null ? Number(raw.price) : null,
    category,
    isFeatured: Boolean(raw.isFeatured),
    published: Boolean(raw.published),
  };
}

export default function EventManager({ initialEvents }: EventManagerProps) {
  const [events, setEvents] = useState(initialEvents);
  const [editingEvent, setEditingEvent] = useState<AdminEvent | null>(null);
  const [formState, setFormState] = useState<Omit<AdminEvent, "id">>(emptyEvent);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()),
    [events],
  );

  function resetForm() {
    setEditingEvent(null);
    setFormState(emptyEvent);
    setFeedback(null);
    setErrorDetails([]);
  }

  async function submitEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setFeedback(null);
    setErrorDetails([]);

    try {
      const payload = {
        ...formState,
        imageUrl: formState.imageUrl || undefined,
        endsAt: formState.endsAt ? formState.endsAt : undefined,
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
        return [savedEvent, ...updated];
      });
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

  function handleEdit(eventData: AdminEvent) {
    setEditingEvent(eventData);
    setFormState({
      title: eventData.title,
      slug: eventData.slug,
      description: eventData.description,
      location: eventData.location,
      startsAt: eventData.startsAt.slice(0, 16),
      endsAt: eventData.endsAt ? eventData.endsAt.slice(0, 16) : "",
      imageUrl: eventData.imageUrl ?? "",
      price: eventData.price ?? null,
      category: eventData.category,
      isFeatured: eventData.isFeatured,
      published: eventData.published,
    });
    setShowForm(true);
    setFeedback(null);
    setErrorDetails([]);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Manage events</h2>
          <p className="mt-1 text-sm text-slate-600">Create, edit, and remove studio events.</p>
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
          <form className="mt-6 space-y-4" onSubmit={submitEvent}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Title
                <input
                  value={formState.title}
                  onChange={(event) => setFormState({ ...formState, title: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Slug
                <input
                  value={formState.slug}
                  onChange={(event) => setFormState({ ...formState, slug: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Location
                <input
                  value={formState.location}
                  onChange={(event) => setFormState({ ...formState, location: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Category
                <select
                  value={formState.category}
                  onChange={(event) =>
                    setFormState({ ...formState, category: event.target.value as EventCategory })
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
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
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Starts at
                <input
                  value={formState.startsAt}
                  onChange={(event) => setFormState({ ...formState, startsAt: event.target.value })}
                  type="datetime-local"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Ends at
                <input
                  value={formState.endsAt ?? ""}
                  onChange={(event) => setFormState({ ...formState, endsAt: event.target.value })}
                  type="datetime-local"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>
            </div>

            <ImageUploadField
              label="Event image"
              section="events"
              value={formState.imageUrl ?? ""}
              onChange={(url) => setFormState({ ...formState, imageUrl: url })}
              hint="JPEG, PNG, WebP, or GIF up to 5 MB. Upload replaces the current image."
            />

            <label className="block text-sm font-medium text-slate-700">
              Description
              <textarea
                value={formState.description}
                onChange={(event) => setFormState({ ...formState, description: event.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                rows={4}
              />
            </label>

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
                  <p className="text-sm text-slate-500">
                    {new Date(eventItem.startsAt).toLocaleString("en-US", {
                      month: "numeric",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                      hour12: true,
                    })}
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
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span>{eventItem.published ? "Published" : "Draft"}</span>
                <span>{eventItem.isFeatured ? "Featured" : "Standard"}</span>
                {eventItem.price !== null && eventItem.price !== undefined ? (
                  <span>${eventItem.price.toFixed(2)}</span>
                ) : null}
              </div>
            </div>
          ))}
          {events.length === 0 ? <p className="text-sm text-slate-600">There are no events yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
