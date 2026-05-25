import { prisma } from "@/lib/prisma";

async function getCounts() {
  const [eventCount, blogCount, subscriberCount, contactCount] = await Promise.all([
    prisma.event.count(),
    prisma.blogPost.count(),
    prisma.newsletterSubscriber.count(),
    prisma.contactMessage.count(),
  ]);

  return { eventCount, blogCount, subscriberCount, contactCount };
}

export default async function AdminOverviewPage() {
  const { eventCount, blogCount, subscriberCount, contactCount } = await getCounts();

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Welcome to Nirvana Admin</h1>
        <p className="mt-2 text-sm text-slate-600">Simple studio management for events, blog posts, subscribers, and contact messages.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Events", value: eventCount },
          { label: "Blog posts", value: blogCount },
          { label: "Subscribers", value: subscriberCount },
          { label: "Contact messages", value: contactCount },
        ].map((item) => (
          <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
