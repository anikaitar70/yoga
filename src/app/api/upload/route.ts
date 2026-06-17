import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/require-admin-session";
import { isUploadSection } from "@/lib/upload-sections";
import {
  buildUploadFilename,
  deleteUploadByUrl,
  saveUploadedImageWithVariants,
  validateImageFile,
} from "@/lib/upload-server";

export async function POST(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Expected multipart form data." }, { status: 400 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const sectionRaw = formData.get("section");
  const replaceUrl = formData.get("replaceUrl");
  const collectionSlug = formData.get("collectionSlug");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing file upload." }, { status: 400 });
  }

  if (typeof sectionRaw !== "string" || !isUploadSection(sectionRaw)) {
    return NextResponse.json(
      {
        error: "Invalid upload section.",
        details: ["section must be one of: events, gallery, blog, homepage, testimonials, pages, branding"],
      },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const validation = validateImageFile(file, buffer);

  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const filename = buildUploadFilename(file.name, validation.extension);

  try {
    if (typeof replaceUrl === "string" && replaceUrl) {
      await deleteUploadByUrl(replaceUrl);
    }

    const subfolder =
      sectionRaw === "gallery" && typeof collectionSlug === "string" && collectionSlug
        ? collectionSlug.replace(/[^a-z0-9-]/gi, "").slice(0, 48)
        : undefined;

    const saved = await saveUploadedImageWithVariants(
      sectionRaw,
      validation.buffer,
      filename,
      subfolder,
    );
    return NextResponse.json({
      url: saved.url,
      uploadPath: saved.url,
      thumbnailUrl: saved.thumbnailUrl,
      mediumUrl: saved.mediumUrl,
      width: saved.width,
      height: saved.height,
    });
  } catch {
    return NextResponse.json({ error: "Unable to save uploaded image." }, { status: 500 });
  }
}
