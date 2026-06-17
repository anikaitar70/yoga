import { prisma } from "@/lib/prisma";
import EventManager from "@/components/admin/EventManager";
import type { AdminEvent } from "@/lib/admin-types";

async function getEvents() {
  const data = await prisma.event.findMany({
    orderBy: { startsAt: "desc" },
  });
  return data.map((item) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    description: item.description,
    location: item.location,
    startsAt: item.startsAt.toISOString(),
    endsAt: item.endsAt?.toISOString() ?? null,
    imageUrl: item.imageUrl,
    price: item.price,
    category: item.category,
    isFeatured: item.isFeatured,
    published: item.published,
  })) as AdminEvent[];
}

export default async function AdminEventsPage() {
  const events = await getEvents();

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Events</h1>
        <p className="mt-2 text-sm text-slate-600">Manage all studio events with create, edit, and delete actions.</p>
      </div>
      <EventManager initialEvents={events} />
    </div>
  );
}
