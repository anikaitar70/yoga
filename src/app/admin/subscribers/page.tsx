import { prisma } from "@/lib/prisma";
import { SubscribersManager } from "@/components/admin/SubscribersManager";
import type { AdminSubscriber } from "@/lib/admin-types";

export default async function AdminSubscribersPage() {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { subscribedAt: "desc" },
  });

  const initialSubscribers: AdminSubscriber[] = subscribers.map((subscriber) => ({
    id: subscriber.id,
    email: subscriber.email,
    name: subscriber.name,
    subscribedAt: subscriber.subscribedAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Newsletter subscribers</h1>
        <p className="mt-2 text-sm text-slate-600">View and remove people who have signed up for your newsletter.</p>
      </div>

      <SubscribersManager initialSubscribers={initialSubscribers} />
    </div>
  );
}
