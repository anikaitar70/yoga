import Link from "next/link";
import type { DiagnosticCategory } from "@prisma/client";
import { getDiagnosticEvents } from "@/lib/diagnostic-events";

const CATEGORIES: Array<{ key: DiagnosticCategory; title: string }> = [
  { key: "UPLOAD_FAILURE", title: "Failed Uploads" },
  { key: "LOGIN_FAILURE", title: "Failed Logins" },
  { key: "CMS_SAVE_FAILURE", title: "CMS Save Failures" },
  { key: "IMAGE_PROCESSING_FAILURE", title: "Image Processing Failures" },
];

type Props = {
  searchParams: Promise<{ page?: string }>;
};

function formatMetadata(metadata: Record<string, unknown> | null): string {
  if (!metadata) return "—";
  const parts = Object.entries(metadata).map(([key, value]) => `${key}: ${String(value)}`);
  return parts.join(" · ") || "—";
}

export default async function AdminDiagnosticsErrorsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;

  const sections = await Promise.all(
    CATEGORIES.map(async (category) => ({
      ...category,
      ...(await getDiagnosticEvents(category.key, page)),
    })),
  );

  const totalPages = Math.max(...sections.map((section) => Math.ceil(section.total / section.pageSize)), 1);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Application Diagnostics</h1>
            <p className="mt-2 text-sm text-slate-600">
              Recent operational issues recorded from existing application error points.
            </p>
          </div>
          <Link
            href="/admin/diagnostics"
            className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Back to diagnostics
          </Link>
        </div>
      </div>

      {sections.map((section) => (
        <section key={section.key} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
          {section.events.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">No recent events.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="px-3 py-2 font-medium">Timestamp</th>
                    <th className="px-3 py-2 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {section.events.map((event) => (
                    <tr key={event.id} className="border-b border-slate-100 align-top">
                      <td className="px-3 py-3 whitespace-nowrap text-slate-600">
                        {new Date(event.createdAt).toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-slate-900">
                        <p>{event.message}</p>
                        <p className="mt-1 text-xs text-slate-500">{formatMetadata(event.metadata)}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ))}

      <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-600">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          {page > 1 ? (
            <Link
              href={`/admin/diagnostics/errors?page=${page - 1}`}
              className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Previous
            </Link>
          ) : null}
          {page < totalPages ? (
            <Link
              href={`/admin/diagnostics/errors?page=${page + 1}`}
              className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Next
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
