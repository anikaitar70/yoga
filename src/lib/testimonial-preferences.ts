export const HIDE_ORIGINALS_KEY = "nirvana-hide-testimonial-originals";

export const TESTIMONIAL_ORIGINALS_EVENT = "nirvana-testimonial-originals-hidden";

export function getHideOriginalsPreference(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(HIDE_ORIGINALS_KEY) === "true";
}

export function setHideOriginalsPreference(hidden: boolean) {
  if (typeof window === "undefined") return;
  if (hidden) {
    window.localStorage.setItem(HIDE_ORIGINALS_KEY, "true");
  } else {
    window.localStorage.removeItem(HIDE_ORIGINALS_KEY);
  }
  window.dispatchEvent(new Event(TESTIMONIAL_ORIGINALS_EVENT));
}
