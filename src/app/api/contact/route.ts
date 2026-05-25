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
    const message = await prisma.contactMessage.create({ data: validation.data });
    return jsonResponse(message, 201);
  } catch (error) {
    return serverError("Unable to create contact message.");
  }
}
