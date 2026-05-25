import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userCreateSchema, formatZodErrors } from "@/lib/validators";
import { badRequest, serverError, jsonResponse } from "@/lib/api";

export async function GET() {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
    return jsonResponse(users);
  } catch (error) {
    return serverError("Unable to fetch users.");
  }
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return badRequest("Invalid JSON request body.");
  }

  const validation = userCreateSchema.safeParse(payload);
  if (!validation.success) {
    return badRequest(formatZodErrors(validation.error));
  }

  try {
    const user = await prisma.user.create({ data: validation.data });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return serverError("Unable to create user.");
  }
}
