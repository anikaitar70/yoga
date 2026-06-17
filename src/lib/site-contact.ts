import type { SiteContact } from "@/content/types";

/** Outbound studio contact — owned by SiteConfig (DB). Editable in /admin/content → Site & footer. */
export const SITE_CONTACT_OWNER = "SiteConfig" as const;

export function hasContactPhone(phone: string | null | undefined): phone is string {
  return Boolean(phone?.trim());
}

export function hasContactEmail(email: string | null | undefined): email is string {
  return Boolean(email?.trim());
}

export function contactLocationLabel(contact: Pick<SiteContact, "address">): string {
  return contact.address.trim();
}

export function seoLocationKeywords(contact: Pick<SiteContact, "address">): string[] {
  const location = contactLocationLabel(contact);
  if (!location) return ["yoga studio", "mindful movement"];
  return ["yoga studio", "mindful movement", `${location} yoga`, location];
}
