import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin-session";
import { pageSeoSchema, formatZodErrors } from "@/lib/validators";
import { badRequest, jsonResponse, serverError } from "@/lib/api";

export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  try {
    const rows = await prisma.pageSeo.findMany({ orderBy: { path: "asc" } });
    return jsonResponse(rows);
  } catch {
    return serverError("Unable to fetch page SEO records.");
  }
}

export async function PUT(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badRequest("Invalid JSON request body.");
  }

  const validation = pageSeoSchema.safeParse(payload);
  if (!validation.success) {
    return badRequest(formatZodErrors(validation.error));
  }

  const data = validation.data;
  const path = data.path.startsWith("/") ? data.path : `/${data.path}`;

  try {
    const row = await prisma.pageSeo.upsert({
      where: { path },
      create: {
        path,
        seoTitle: data.seoTitle,
        metaDescription: data.metaDescription,
        ogImageUrl: data.ogImageUrl,
        canonicalUrlOverride: data.canonicalUrlOverride || null,
        focusKeywords: data.focusKeywords ?? [],
        jaTranslationStatus: data.jaTranslationStatus ?? "MACHINE",
      },
      update: {
        seoTitle: data.seoTitle,
        metaDescription: data.metaDescription,
        ogImageUrl: data.ogImageUrl,
        canonicalUrlOverride: data.canonicalUrlOverride || null,
        focusKeywords: data.focusKeywords ?? [],
        jaTranslationStatus: data.jaTranslationStatus ?? "MACHINE",
      },
    });
    return jsonResponse(row);
  } catch {
    return serverError("Unable to save page SEO.");
  }
}
