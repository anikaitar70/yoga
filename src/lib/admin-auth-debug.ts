/** Temporary admin auth tracing — remove when ngrok login is stable. */

export type AuthDebugTag = "LOGIN" | "AUTH API" | "MIDDLEWARE" | "COOKIE" | "FETCH" | "LAYOUT" | "DEBUG";

export function isAdminAuthDebugEnabled(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.ADMIN_AUTH_DEBUG === "true";
}

/** Mask secrets — only exposes length, never value. */
export function maskSecret(value: string | undefined | null): string {
  if (!value) return "(empty)";
  return `***[len=${value.length}]`;
}

export function headersToRecord(headers: Headers): Record<string, string> {
  const record: Record<string, string> = {};
  headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower.includes("cookie") || lower.includes("authorization")) {
      record[key] = "[redacted]";
    } else {
      record[key] = value;
    }
  });
  return record;
}

export function logAuthTrace(tag: AuthDebugTag, message: string, data?: Record<string, unknown>) {
  if (!isAdminAuthDebugEnabled()) return;
  if (data) {
    console.info(`[${tag}] ${message}`, data);
  } else {
    console.info(`[${tag}] ${message}`);
  }
}

/** @deprecated Use logAuthTrace — kept for existing call sites during migration */
export function logAdminAuthDebug(
  context: string,
  data: Record<string, string | number | boolean | null | undefined>,
) {
  logAuthTrace("DEBUG", context, data as Record<string, unknown>);
}
