import { collectAnalytics } from "@/lib/analytics";

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value.toLocaleString()}</p>
    </div>
  );
}

export default async function AdminAnalyticsPage() {
  const data = await collectAnalytics();

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Visitor Analytics</h1>
        <p className="mt-2 text-sm text-slate-600">
          Privacy-friendly analytics using anonymous visitor cookies. No IP addresses or personal data are stored.
        </p>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Visitors</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <MetricCard label="Total Visitors" value={data.visitors.total} />
          <MetricCard label="Visitors Today" value={data.visitors.today} />
          <MetricCard label="Visitors This Week" value={data.visitors.thisWeek} />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Traffic</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <MetricCard label="Total Page Views" value={data.pageViews.total} />
          <MetricCard label="Views Today" value={data.pageViews.today} />
          <MetricCard label="Views This Week" value={data.pageViews.thisWeek} />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Top Pages</h2>
        {data.topPages.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">No page views recorded yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-3 py-2 font-medium">Page</th>
                  <th className="px-3 py-2 font-medium">Views</th>
                </tr>
              </thead>
              <tbody>
                {data.topPages.map((row) => (
                  <tr key={row.path} className="border-b border-slate-100">
                    <td className="px-3 py-3 text-slate-900">{row.path}</td>
                    <td className="px-3 py-3 text-slate-600">{row.views.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
