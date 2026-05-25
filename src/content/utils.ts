/**
 * Simulates network latency when CONTENT_FETCH_DELAY_MS is set (e.g. local CMS testing).
 * Replace repository implementations with real fetches — keep this helper or remove it.
 */
export async function resolveContent<T>(data: T): Promise<T> {
  const delayMs = Number(process.env.CONTENT_FETCH_DELAY_MS ?? 0);
  if (delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return data;
}
