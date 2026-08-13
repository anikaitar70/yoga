import { prisma } from "@/lib/prisma";
import { ContactsManager } from "@/components/admin/ContactsManager";
import type { AdminContactMessage } from "@/lib/admin-types";

export default async function AdminContactPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  const initialMessages: AdminContactMessage[] = messages.map((message) => ({
    id: message.id,
    name: message.name,
    email: message.email,
    subject: message.subject,
    message: message.message,
    preferredContactMethod: message.preferredContactMethod,
    createdAt: message.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Contact messages</h1>
        <p className="mt-2 text-sm text-slate-600">Review and remove inquiries sent through the contact form.</p>
      </div>

      <ContactsManager initialMessages={initialMessages} />
    </div>
  );
}
