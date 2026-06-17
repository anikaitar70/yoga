/** Client-side login execution trace (browser console + on-page panel). */

export type LoginTraceEntry = {
  at: string;
  step: string;
  data?: Record<string, unknown>;
};

const MAX_ENTRIES = 80;

function getStore(): LoginTraceEntry[] {
  if (typeof window === "undefined") return [];
  const w = window as Window & { __LOGIN_TRACE__?: LoginTraceEntry[] };
  if (!w.__LOGIN_TRACE__) w.__LOGIN_TRACE__ = [];
  return w.__LOGIN_TRACE__;
}

export function traceLogin(step: string, data?: Record<string, unknown>) {
  const entry: LoginTraceEntry = {
    at: new Date().toISOString(),
    step,
    data,
  };

  const store = getStore();
  store.push(entry);
  if (store.length > MAX_ENTRIES) store.splice(0, store.length - MAX_ENTRIES);

  // warn = more visible than info in DevTools
  if (data) {
    console.warn(`[LOGIN] ${step}`, data);
  } else {
    console.warn(`[LOGIN] ${step}`);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("login-trace-update"));
  }
}

export function getLoginTrace(): LoginTraceEntry[] {
  return [...getStore()];
}

export function clearLoginTrace() {
  const store = getStore();
  store.length = 0;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("login-trace-update"));
  }
}

export function resolveLoginApiUrl(path = "/api/admin/login"): string {
  if (typeof window === "undefined") return path;
  return new URL(path, window.location.origin).href;
}
