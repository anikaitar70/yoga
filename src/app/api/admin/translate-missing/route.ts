import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/require-admin-session";
import { translateMissingJaFields } from "@/lib/ja-auto";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // allow up to 5min for site-wide translation

export async function POST() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  try {
    const result = await translateMissingJaFields();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[translate-missing] error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Translation failed" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return POST();
}
