import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/require-admin-session";
import {
  buildUploadFilename,
  saveUploadedImage,
  validateImageFile,
} from "@/lib/upload-server";

/** @deprecated Use POST /api/upload with section=events instead. */
export async function POST(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Expected multipart form data." }, { status: 400 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing file upload." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const validation = validateImageFile(file, buffer);

  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const filename = buildUploadFilename(file.name, validation.extension);

  try {
    const url = await saveUploadedImage("events", validation.buffer, filename);
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ error: "Unable to save uploaded image." }, { status: 500 });
  }
}
