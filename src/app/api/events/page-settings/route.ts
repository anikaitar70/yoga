import { requireAdminSession } from "@/lib/require-admin-session";
import { revalidateEvents } from "@/lib/revalidate-events";
import {
  readEventsPageSettings,
  writeEventsPageSettings,
} from "@/lib/events-page-settings-store";
import { eventsPageSettingsUpdateSchema, formatZodErrors } from "@/lib/validators";
import { badRequest, serverError, jsonResponse } from "@/lib/api";

export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  try {
    return jsonResponse(await readEventsPageSettings());
  } catch {
    return serverError("Unable to load events page settings.");
  }
}

export async function PATCH(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badRequest("Invalid JSON request body.");
  }

  const validation = eventsPageSettingsUpdateSchema.safeParse(payload);
  if (!validation.success) {
    return badRequest(formatZodErrors(validation.error));
  }

  try {
    const saved = await writeEventsPageSettings(validation.data);
    revalidateEvents();
    return jsonResponse(saved);
  } catch {
    return serverError("Unable to save events page settings.");
  }
}
