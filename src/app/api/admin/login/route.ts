import { NextResponse } from "next/server";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

export async function POST(request: Request) {
  if (!ADMIN_SECRET) {
    return NextResponse.json({ error: "Admin secret is not configured." }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || !("secret" in body)) {
    return NextResponse.json({ error: "Secret is required." }, { status: 400 });
  }

  const secret = (body as { secret?: unknown }).secret;
  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: "nirvana_admin_token",
    value: ADMIN_SECRET,
    httpOnly: true,
    path: "/admin",
    maxAge: 60 * 60 * 24,
  });
  return response;
}
