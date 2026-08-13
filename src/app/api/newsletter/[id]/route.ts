import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin-session";
import { notFound, serverError } from "@/lib/api";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;

  try {
    const existing = await prisma.newsletterSubscriber.findUnique({ where: { id } });
    if (!existing) {
      return notFound("Subscriber not found.");
    }

    await prisma.newsletterSubscriber.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch {
    return serverError("Unable to delete subscriber.");
  }
}
