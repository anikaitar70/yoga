import { headersToRecord, logAuthTrace } from "@/lib/admin-auth-debug";

const NGROK_SKIP_HEADER = "ngrok-skip-browser-warning";

function isNgrokInterstitialHtml(text: string): boolean {
  const lower = text.toLowerCase();
  return lower.includes("<!doctype") && lower.includes("ngrok");
}

export function getAdminFetchHeaders(contentType = "application/json"): HeadersInit {
  return {
    "Content-Type": contentType,
    [NGROK_SKIP_HEADER]: "1",
  };
}

/** Same-origin admin API fetch with ngrok bypass and credentials. */
export async function adminFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  const method = init?.method ?? "GET";
  const credentials = init?.credentials ?? "include";

  const headers = new Headers(init?.headers);

  if (!headers.has(NGROK_SKIP_HEADER)) {
    headers.set(NGROK_SKIP_HEADER, "1");
  }

  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;
  if (init?.body != null && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  logAuthTrace("FETCH", "Request starting", {
    url,
    method,
    credentials,
    contentType: headers.get("Content-Type"),
    ngrokSkipHeader: headers.get(NGROK_SKIP_HEADER),
    headerKeys: Array.from(headers.keys()),
  });

  let response: Response;
  try {
    response = await fetch(input, {
      ...init,
      headers,
      credentials,
    });
  } catch (error) {
    logAuthTrace("FETCH", "Request threw", {
      url,
      name: error instanceof Error ? error.name : "unknown",
      message: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }

  logAuthTrace("FETCH", "Response received", {
    url,
    status: response.status,
    statusText: response.statusText,
    ok: response.ok,
    type: response.type,
    contentType: response.headers.get("content-type"),
    setCookiePresent: Boolean(response.headers.get("set-cookie")),
  });

  return response;
}

export type AdminJsonResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status: number };

/** Parse admin API JSON; detect ngrok HTML interstitial and other non-JSON responses. */
export async function parseAdminJsonResponse<T>(response: Response): Promise<AdminJsonResult<T>> {
  const contentType = response.headers.get("content-type") ?? "";

  logAuthTrace("FETCH", "Parsing response body", {
    status: response.status,
    contentType,
  });

  if (!contentType.includes("application/json")) {
    const text = await response.text();
    const ngrokHtml = isNgrokInterstitialHtml(text);

    logAuthTrace("FETCH", "Non-JSON response detected", {
      status: response.status,
      contentType,
      ngrokInterstitial: ngrokHtml,
      bodyPreview: text.slice(0, 160),
      responseHeaders: headersToRecord(response.headers),
    });

    const isHtml = contentType.includes("text/html");
    const serverError =
      isHtml && response.status === 504
        ? "The server took too long to respond. Try again or enter the testimonial text manually."
        : isHtml && response.status >= 500
          ? "Server error — try again or enter the text manually."
          : isHtml && response.status === 404
            ? "API route not found."
            : null;

    return {
      ok: false,
      status: response.status,
      error: ngrokHtml
        ? "Ngrok returned its browser warning page instead of the API. Refresh the page and try again."
        : serverError ?? `Unexpected response (${contentType || "unknown"}). Please try again.`,
    };
  }

  try {
    const data = (await response.json()) as T;
    logAuthTrace("FETCH", "JSON parse success", {
      status: response.status,
      dataKeys: typeof data === "object" && data !== null ? Object.keys(data) : [],
    });
    return { ok: true, data };
  } catch (error) {
    logAuthTrace("FETCH", "JSON parse failure", {
      status: response.status,
      name: error instanceof Error ? error.name : "unknown",
      message: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, status: response.status, error: "Invalid JSON from server." };
  }
}

/** JSON admin API helper with ngrok-safe fetch and response validation. */
export async function adminJsonRequest<T>(
  url: string,
  method: string,
  payload?: unknown,
): Promise<T> {
  const isTestimonialSectionSave =
    typeof payload === "object" &&
    payload !== null &&
    "payload" in payload &&
    typeof (payload as { payload?: unknown }).payload === "object" &&
    (payload as { payload?: { items?: unknown } }).payload !== null &&
    Array.isArray((payload as { payload: { items?: unknown } }).payload.items);

  logAuthTrace("FETCH", "adminJsonRequest called", { url, method, hasPayload: payload !== undefined });

  const response = await adminFetch(url, {
    method,
    headers: getAdminFetchHeaders(),
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });

  const parsed = await parseAdminJsonResponse<T>(response);
  if (isTestimonialSectionSave) {
    console.info("[testimonial-save:fetch:response]", {
      url,
      method,
      status: response.status,
      ok: response.ok,
      parsedOk: parsed.ok,
    });
  }

  if (!parsed.ok) {
    if (isTestimonialSectionSave) {
      console.error("[testimonial-save:fetch:parse-error]", { url, status: response.status, error: parsed.error });
    }
    throw new Error(parsed.error);
  }

  if (!response.ok) {
    const body =
      typeof parsed.data === "object" && parsed.data !== null
        ? (parsed.data as { error?: unknown; details?: unknown })
        : null;
    const message =
      body && typeof body.error === "string" ? body.error : response.statusText;
    const details =
      body && Array.isArray(body.details)
        ? body.details.filter((item): item is string => typeof item === "string")
        : [];
    const detailText = details.length ? ` ${details.join(" ")}` : "";
    if (isTestimonialSectionSave) {
      console.error("[testimonial-save:fetch:http-error]", {
        url,
        status: response.status,
        message,
        details,
      });
    }
    throw new Error((message || "Request failed.") + detailText);
  }

  return parsed.data;
}

/** DELETE helper — accepts 204 No Content and surfaces API errors. */
export async function adminDeleteRequest(url: string): Promise<void> {
  const response = await adminFetch(url, { method: "DELETE" });

  if (response.ok) {
    return;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const parsed = await parseAdminJsonResponse<{ error?: string }>(response);
    if (!parsed.ok) {
      throw new Error(parsed.error);
    }
    const message =
      typeof parsed.data === "object" &&
      parsed.data !== null &&
      typeof parsed.data.error === "string"
        ? parsed.data.error
        : response.statusText;
    throw new Error(message || "Delete failed.");
  }

  const text = await response.text();
  if (isNgrokInterstitialHtml(text)) {
    throw new Error(
      "Ngrok returned its browser warning page instead of the API. Refresh the page and try again.",
    );
  }

  throw new Error(response.statusText || "Delete failed.");
}
