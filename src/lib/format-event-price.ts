/** Display price from Prisma Float or legacy string values. */
export function formatEventPriceDisplay(price: string | number | null | undefined): string | null {
  if (price === null || price === undefined || price === "") {
    return null;
  }

  if (typeof price === "number") {
    if (!Number.isFinite(price)) return null;
    return Number.isInteger(price) ? String(price) : price.toString();
  }

  const trimmed = price.trim();
  if (!trimmed) return null;

  const numeric = Number(trimmed.replace(/[^\d.-]/g, ""));
  if (!Number.isNaN(numeric) && trimmed.replace(/[^\d]/g, "") === String(numeric)) {
    return Number.isInteger(numeric) ? String(numeric) : numeric.toString();
  }

  return trimmed;
}
