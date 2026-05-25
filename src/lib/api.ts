import { NextResponse } from "next/server";

export function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function badRequest(message: string | string[]) {
  return NextResponse.json(
    { error: "Bad request", details: Array.isArray(message) ? message : [message] },
    { status: 400 },
  );
}

export function validationError(message: string | string[]) {
  return NextResponse.json(
    { error: "Validation error", details: Array.isArray(message) ? message : [message] },
    { status: 422 },
  );
}

export function notFound(message = "Resource not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function serverError(message = "Internal server error") {
  return NextResponse.json({ error: message }, { status: 500 });
}
