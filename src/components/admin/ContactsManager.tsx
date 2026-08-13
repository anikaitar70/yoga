"use client";

import { useState } from "react";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { adminDeleteRequest } from "@/lib/admin-fetch";
import type { AdminContactMessage } from "@/lib/admin-types";

type ContactsManagerProps = {
  initialMessages: AdminContactMessage[];
};

export function ContactsManager({ initialMessages }: ContactsManagerProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [deleteTarget, setDeleteTarget] = useState<AdminContactMessage | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    setFeedback(null);
    try {
      await adminDeleteRequest(`/api/contact/${deleteTarget.id}`);
      setMessages((current) => current.filter((item) => item.id !== deleteTarget.id));
      setFeedback(`Deleted message from ${deleteTarget.name}.`);
      setDeleteTarget(null);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to delete contact message.");
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <>
      {feedback ? (
        <p className={`text-sm ${feedback.startsWith("Deleted") ? "text-green-700" : "text-red-600"}`}>
          {feedback}
        </p>
      ) : null}

      <div className="space-y-4">
        {messages.map((message) => (
          <article key={message.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm text-slate-500">{message.subject}</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">{message.name}</h2>
              </div>
              <div className="flex flex-col items-start gap-2 sm:items-end">
                <p className="text-sm text-slate-600">{new Date(message.createdAt).toLocaleString()}</p>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(message)}
                  className="rounded-2xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Email</p>
                <p className="mt-1 text-sm text-slate-900">{message.email}</p>
              </div>
              {message.preferredContactMethod ? (
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Preferred contact</p>
                  <p className="mt-1 text-sm text-slate-900">{message.preferredContactMethod}</p>
                </div>
              ) : null}
              <div className="sm:col-span-2">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Message</p>
                <p className="mt-1 text-sm text-slate-700">{message.message}</p>
              </div>
            </div>
          </article>
        ))}
        {messages.length === 0 ? <p className="text-sm text-slate-600">No contact messages yet.</p> : null}
      </div>

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete contact message?"
        message={
          deleteTarget
            ? `Permanently delete the message from ${deleteTarget.name}? This cannot be undone.`
            : ""
        }
        busy={deleteBusy}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
