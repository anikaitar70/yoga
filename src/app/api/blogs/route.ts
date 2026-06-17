import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin-session";
import { blogCreateSchema, formatZodErrors } from "@/lib/validators";
import { badRequest, serverError, jsonResponse } from "@/lib/api";
import { slugify } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeUnpublished = searchParams.get("admin") === "1";
  const unauthorized = includeUnpublished ? await requireAdminSession() : null;
  if (unauthorized) return unauthorized;

  try {
    const posts = await prisma.blogPost.findMany({
      where: includeUnpublished ? undefined : { published: true },
      orderBy: { publishedAt: "desc" },
    });
    return jsonResponse(posts);
  } catch (error) {
    return serverError("Unable to fetch blog posts.");
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return badRequest("Invalid JSON request body.");
  }

  const validation = blogCreateSchema.safeParse(payload);
  if (!validation.success) {
    return badRequest(formatZodErrors(validation.error));
  }

  const data = validation.data;

  try {
    const post = await prisma.blogPost.create({
      data: {
        ...data,
        slug: slugify(data.slug || data.title),
        tags: data.tags ?? [],
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
      },
    });
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    return serverError("Unable to create blog post.");
  }
}
