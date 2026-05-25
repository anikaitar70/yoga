import { prisma } from "@/lib/prisma";
import { galleryCreateSchema, formatZodErrors } from "@/lib/validators";
import { badRequest, serverError, jsonResponse } from "@/lib/api";

export async function GET() {
  try {
    const images = await prisma.galleryImage.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
    });
    return jsonResponse(images);
  } catch (error) {
    return serverError("Unable to fetch gallery images.");
  }
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return badRequest("Invalid JSON request body.");
  }

  const validation = galleryCreateSchema.safeParse(payload);
  if (!validation.success) {
    return badRequest(formatZodErrors(validation.error));
  }

  try {
    const item = await prisma.galleryImage.create({ data: validation.data });
    return jsonResponse(item, 201);
  } catch (error) {
    return serverError("Unable to create gallery image.");
  }
}
