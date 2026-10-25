import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { translateMissingJaFields } from "@/lib/ja-auto";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Machine-to-machine endpoint for host cron: `Authorization: Bearer $CRON_SECRET`.
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });

  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await translateMissingJaFields();
  return NextResponse.json({ success: true, ...result });
}
