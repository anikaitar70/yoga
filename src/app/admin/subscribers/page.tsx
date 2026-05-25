import { prisma } from "@/lib/prisma";

export default async function AdminSubscribersPage() {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { subscribedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Newsletter subscribers</h1>
        <p className="mt-2 text-sm text-slate-600">View people who have signed up for your newsletter.</p>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3">Subscribed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {subscribers.map((subscriber) => (
              <tr key={subscriber.id} className="hover:bg-slate-50">
                <td className="px-3 py-4 text-slate-900">{subscriber.name ?? "—"}</td>
                <td className="px-3 py-4 text-slate-900">{subscriber.email}</td>
                <td className="px-3 py-4 text-slate-600">{new Date(subscriber.subscribedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
