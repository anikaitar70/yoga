import { prisma } from "@/lib/prisma";
import { contactCreateSchema, formatZodErrors } from "@/lib/validators";
import { badRequest, serverError, jsonResponse } from "@/lib/api";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return badRequest("Invalid JSON request body.");
  }

  const validation = contactCreateSchema.safeParse(payload);
  if (!validation.success) {
    return badRequest(formatZodErrors(validation.error));
  }

  try {
    const data = validation.data;
    const message = await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.phone
          ? `${data.message}\n\nPhone: ${data.phone}`
          : data.message,
        preferredContactMethod: data.preferredContactMethod,
      },
    });

    if (data.subscribeToNewsletter) {
      await prisma.newsletterSubscriber.upsert({
        where: { email: data.email },
        update: { name: data.name },
        create: {
          email: data.email,
          name: data.name,
        },
      });
    }

    return jsonResponse(message, 201);
  } catch (error) {
    return serverError("Unable to create contact message.");
  }
}
