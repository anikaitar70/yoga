import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin-session";
import { blogUpdateSchema, formatZodErrors } from "@/lib/validators";
import { badRequest, notFound, serverError, jsonResponse } from "@/lib/api";
import { slugify } from "@/lib/utils";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const includeUnpublished = new URL(request.url).searchParams.get("admin") === "1";
  const unauthorized = includeUnpublished ? await requireAdminSession() : null;
  if (unauthorized) return unauthorized;

  try {
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) {
      return notFound("Blog post not found.");
    }
    if (!post.published && !includeUnpublished) {
      return notFound("Blog post not found.");
    }
    return jsonResponse(post);
  } catch (error) {
    return serverError("Unable to fetch blog post.");
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return badRequest("Invalid JSON request body.");
  }

  const validation = blogUpdateSchema.safeParse(payload);
  if (!validation.success) {
    return badRequest(formatZodErrors(validation.error));
  }

  const data = validation.data;

  try {
    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...data,
        slug: data.slug ? slugify(data.slug) : undefined,
        tags: data.tags ?? undefined,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
      },
    });
    return jsonResponse(post);
  } catch (error) {
    return serverError("Unable to update blog post.");
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;

  try {
    await prisma.blogPost.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch (error) {
    return notFound("Blog post not found.");
  }
}
