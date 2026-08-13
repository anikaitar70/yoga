"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminFetch, parseAdminJsonResponse } from "@/lib/admin-fetch";
import type { AdminEvent } from "@/lib/admin-types";
import { specialEventPublicPath } from "@/lib/event-page-section";

type Props = {
  initialEvents: AdminEvent[];
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function SpecialEventsManager({ initialEvents }: Props) {
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function createSpecialEvent() {
    const title = window.prompt("Special event title");
    if (!title?.trim()) return;
    const slug = window.prompt("URL slug", slugify(title));
    if (!slug?.trim()) return;

    setBusy(true);
    setFeedback(null);
    try {
      const response = await adminFetch("/api/events", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          description: "Add a summary for this special event.",
          location: "TBD",
          startsAt: new Date().toISOString(),
          published: false,
          isSpecialEvent: true,
        }),
      });
      const parsed = await parseAdminJsonResponse<Record<string, unknown> & { id?: string; error?: string }>(
        response,
      );
      if (!parsed.ok) {
        setFeedback(parsed.error);
        return;
      }
      if (!response.ok || !parsed.data.id) {
        setFeedback(String(parsed.data.error || "Unable to create special event."));
        return;
      }
      router.push(`/admin/special-events/${parsed.data.id}`);
      router.refresh();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to create special event.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteEvent(eventId: string) {
    if (!window.confirm("Delete this special event and all of its page sections?")) return;
    setBusy(true);
    try {
      await adminFetch(`/api/events/${eventId}`, { method: "DELETE" });
      setEvents((current) => current.filter((event) => event.id !== eventId));
      router.refresh();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to delete event.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          disabled={busy}
          onClick={() => void createSpecialEvent()}
          className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Create special event
        </button>
        {feedback ? <p className="text-sm text-slate-600">{feedback}</p> : null}
      </div>

      <div className="space-y-3">
        {events.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
            No special events yet.
          </p>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4"
            >
              <div>
                <p className="font-medium text-slate-900">{event.title}</p>
                <p className="text-sm text-slate-500">
                  /events/special/{event.slug} · {event.published ? "Published" : "Draft"} ·{" "}
                  {event.pageSectionCount ?? 0} sections
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/special-events/${event.id}`}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Edit
                </Link>
                <Link
                  href={specialEventPublicPath(event.slug)}
                  target="_blank"
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Preview
                </Link>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void deleteEvent(event.id)}
                  className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
