import { prisma } from "@/lib/prisma";

export default async function AdminContactPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Contact messages</h1>
        <p className="mt-2 text-sm text-slate-600">Review inquiries sent through the contact form.</p>
      </div>

      <div className="space-y-4">
        {messages.map((message) => (
          <article key={message.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-500">{message.subject}</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">{message.name}</h2>
              </div>
              <p className="text-sm text-slate-600">{new Date(message.createdAt).toLocaleString()}</p>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Email</p>
                <p className="mt-1 text-sm text-slate-900">{message.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Message</p>
                <p className="mt-1 text-sm text-slate-700">{message.message}</p>
              </div>
            </div>
          </article>
        ))}
        {messages.length === 0 ? <p className="text-sm text-slate-600">No contact messages yet.</p> : null}
      </div>
    </div>
  );
}
