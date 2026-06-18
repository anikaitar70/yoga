import { NextResponse } from "next/server";
import { logBrandingTrace } from "@/lib/branding-diagnostics";
import { isBrandKey, persistBrandingLogo } from "@/lib/persist-branding-logo";
import { requireAdminSession } from "@/lib/require-admin-session";
import { recordDiagnosticEvent } from "@/lib/app-diagnostics";
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
  const brandKeyRaw = formData.get("brandKey");

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
    recordDiagnosticEvent("UPLOAD_FAILURE", validation.error, {
      fileName: file.name,
      reason: validation.error,
    });
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
    if (sectionRaw === "branding") {
      logBrandingTrace("upload_branding", {
        url: saved.url,
        replaceUrl,
        brandKey: typeof brandKeyRaw === "string" ? brandKeyRaw : null,
      });

      if (typeof brandKeyRaw === "string" && isBrandKey(brandKeyRaw)) {
        const persisted = await persistBrandingLogo(brandKeyRaw, saved.url);
        return NextResponse.json({
          url: saved.url,
          uploadPath: saved.url,
          thumbnailUrl: saved.thumbnailUrl,
          mediumUrl: saved.mediumUrl,
          width: saved.width,
          height: saved.height,
          branding: persisted.branding,
          brandingPersisted: true,
        });
      }

      logBrandingTrace("upload_branding_skipped_persist", {
        reason: "missing or invalid brandKey",
        brandKey: brandKeyRaw,
      });
    }

    return NextResponse.json({
      url: saved.url,
      uploadPath: saved.url,
      thumbnailUrl: saved.thumbnailUrl,
      mediumUrl: saved.mediumUrl,
      width: saved.width,
      height: saved.height,
    });
  } catch (error) {
    recordDiagnosticEvent("UPLOAD_FAILURE", "Unable to save uploaded image.", {
      fileName: file.name,
      reason: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Unable to save uploaded image." }, { status: 500 });
  }
}
