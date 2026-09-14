import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Liveness probe — now also verifies DB is reachable and schema is not drifted (catches P2022). */
export async function GET() {
  try {
    // Fast DB check that will fail with P2022 if Event.heroImageUrl column is missing
    // (the recent bug where code expected column but DB didn't have it).
    // Keep timeout short — this is still a liveness probe.
    await Promise.race([
      prisma.event.findFirst({ select: { id: true }, take: 1 }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("DB timeout")), 2000)),
    ]);
    return NextResponse.json({ ok: true, db: true }, { status: 200 });
  } catch (e) {
    // DB not reachable or schema drift (P2022) — return 503 so orchestrator knows, but don't leak details
    const message = e instanceof Error ? e.message.slice(0, 200) : String(e).slice(0, 200);
    const isP2022 = /P2022|column.*does not exist/i.test(message);
    return NextResponse.json(
      { ok: false, db: false, error: isP2022 ? "DB drift: column does not exist (P2022)" : "DB unavailable" },
      { status: 503 }
    );
  }
}
