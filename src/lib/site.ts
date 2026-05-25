const fallback =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://nirvanayoga.example";

export function getMetadataBase(): URL {
  try {
    return new URL(fallback);
  } catch {
    return new URL("https://nirvanayoga.example");
  }
}
