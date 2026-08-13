import { z } from "zod";

/** Internal site path or HTTPS URL for event CTAs. */
export const nullableEventCtaUrlSchema = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return null;
  return value;
}, z.union([
  z
    .string()
    .url()
    .refine((href) => href.startsWith("https://"), {
      message: "External URL must use HTTPS",
    }),
  z
    .string()
    .min(2)
    .refine((href) => href.startsWith("/") && !href.startsWith("//"), {
      message: "Internal path must start with /",
    }),
  z.null(),
]));

export function isExternalEventCtaUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}
