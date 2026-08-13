"use client";

import { useState } from "react";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { adminDeleteRequest } from "@/lib/admin-fetch";
import type { AdminSubscriber } from "@/lib/admin-types";

type SubscribersManagerProps = {
  initialSubscribers: AdminSubscriber[];
};

export function SubscribersManager({ initialSubscribers }: SubscribersManagerProps) {
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [deleteTarget, setDeleteTarget] = useState<AdminSubscriber | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    setFeedback(null);
    try {
      await adminDeleteRequest(`/api/newsletter/${deleteTarget.id}`);
      setSubscribers((current) => current.filter((item) => item.id !== deleteTarget.id));
      setFeedback(`Deleted ${deleteTarget.email}.`);
      setDeleteTarget(null);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to delete subscriber.");
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

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3">Subscribed</th>
              <th className="px-3 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {subscribers.map((subscriber) => (
              <tr key={subscriber.id} className="hover:bg-slate-50">
                <td className="px-3 py-4 text-slate-900">{subscriber.name ?? "—"}</td>
                <td className="px-3 py-4 text-slate-900">{subscriber.email}</td>
                <td className="px-3 py-4 text-slate-600">
                  {new Date(subscriber.subscribedAt).toLocaleString()}
                </td>
                <td className="px-3 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(subscriber)}
                    className="rounded-2xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {subscribers.length === 0 ? (
          <p className="px-3 py-6 text-sm text-slate-600">No subscribers yet.</p>
        ) : null}
      </div>

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete subscriber?"
        message={
          deleteTarget
            ? `Remove ${deleteTarget.email} from the newsletter list? This cannot be undone.`
            : ""
        }
        busy={deleteBusy}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
