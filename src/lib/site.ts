import { getAppUrl } from "@/lib/env";

export function getMetadataBase(): URL {
  try {
    return new URL(getAppUrl());
  } catch {
    return new URL("https://nirvanayoga.org");
  }
}
