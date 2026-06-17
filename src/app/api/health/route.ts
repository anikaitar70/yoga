import { NextResponse } from "next/server";

/** Lightweight liveness probe — no database access. */
export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}
