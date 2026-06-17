import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin-session";
import { newsletterCreateSchema, formatZodErrors } from "@/lib/validators";
import { badRequest, serverError, jsonResponse } from "@/lib/api";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return badRequest("Invalid JSON request body.");
  }

  const validation = newsletterCreateSchema.safeParse(payload);
  if (!validation.success) {
    return badRequest(formatZodErrors(validation.error));
  }

  try {
    const subscriber = await prisma.newsletterSubscriber.create({
      data: validation.data,
    });
    return jsonResponse(subscriber, 201);
  } catch (error) {
    return serverError("Unable to subscribe to the newsletter.");
  }
}

export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { subscribedAt: "desc" },
    });
    return jsonResponse(subscribers);
  } catch (error) {
    return serverError("Unable to fetch newsletter subscribers.");
  }
}
