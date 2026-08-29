import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/require-admin-session";
import { translatePlainTextServer, translateRichHtmlServer } from "@/lib/translate-server";

const bodySchema = z
  .object({
    html: z.string().optional(),
    plainText: z.string().optional(),
    text: z.string().optional(), // alias for plainText
    mode: z.enum(["html", "plain"]).optional(),
  })
  .refine((data) => Boolean(data.html?.trim() || data.plainText?.trim() || data.text?.trim()), {
    message: "Provide html or plainText/text",
  });

export async function POST(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 });
  }

  const { html, plainText, text, mode } = parsed.data;

  try {
    if (html && (mode === "html" || !plainText)) {
      // Prefer html when present
      const input = html.trim();
      if (!input) return NextResponse.json({ translatedHtml: "", isMock: false });
      // Basic size guard: 20k chars max to avoid abuse
      if (input.length > 20000) {
        return NextResponse.json({ error: "HTML too large (max 20000 chars)" }, { status: 413 });
      }
      const { translated, isMock } = await translateRichHtmlServer(input);
      return NextResponse.json({ translatedHtml: translated, isMock });
    }

    const inputText = (plainText ?? text ?? "").trim();
    if (!inputText) return NextResponse.json({ translatedText: "", isMock: false });
    if (inputText.length > 8000) {
      return NextResponse.json({ error: "Text too large (max 8000 chars)" }, { status: 413 });
    }
    const { translated, isMock } = await translatePlainTextServer(inputText);
    return NextResponse.json({ translatedText: translated, isMock });
  } catch (error) {
    console.error("[translate] error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Translation failed" },
      { status: 500 },
    );
  }
}
