import type { ReactNode } from "react";
import type { SiteContact } from "@/content/types";
import { formatPhoneHref } from "@/lib/format";
import { hasContactEmail, hasContactPhone } from "@/lib/site-contact";
import { cn } from "@/lib/utils";

type StudioContactLinksProps = {
  contact: SiteContact;
  className?: string;
  linkClassName?: string;
  layout?: "stack" | "inline";
  showAddress?: boolean;
  centered?: boolean;
};

/** Renders studio email, phone, and address from SiteConfig.contact only. */
export function StudioContactLinks({
  contact,
  className,
  linkClassName,
  layout = "stack",
  showAddress = true,
  centered = false,
}: StudioContactLinksProps) {
  const items: ReactNode[] = [];

  if (hasContactEmail(contact.email)) {
    items.push(
      <a
        key="email"
        href={`mailto:${contact.email}`}
        className={cn("transition-colors hover:text-foreground", linkClassName)}
      >
        {contact.email}
      </a>,
    );
  }

  if (hasContactPhone(contact.phone)) {
    items.push(
      <a
        key="phone"
        href={formatPhoneHref(contact.phone)}
        className={cn("transition-colors hover:text-foreground", linkClassName)}
      >
        {contact.phone}
      </a>,
    );
  }

  if (showAddress && contact.address.trim()) {
    items.push(<span key="address">{contact.address}</span>);
  }

  if (items.length === 0) return null;

  if (layout === "inline") {
    return (
      <div className={cn("flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted", centered && "justify-center", className)}>
        {items}
      </div>
    );
  }

  return (
    <address
      className={cn(
        "space-y-2.5 text-sm not-italic leading-relaxed text-muted",
        centered && "flex flex-col items-center",
        className,
      )}
    >
      {items.map((item) => item)}
    </address>
  );
}
