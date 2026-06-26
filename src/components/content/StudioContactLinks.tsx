"use client";

import type { ReactNode } from "react";
import type { SiteContact } from "@/content/types";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { formatPhoneHref } from "@/lib/format";
import {
  contactLocationLabel,
  hasContactEmail,
  hasContactPhone,
  normalizeContactEmail,
} from "@/lib/site-contact";
import { cn } from "@/lib/utils";

type StudioContactLinksProps = {
  contact: SiteContact;
  className?: string;
  linkClassName?: string;
  layout?: "stack" | "inline";
  showAddress?: boolean;
  centered?: boolean;
  labeled?: boolean;
};

function ContactBlock({
  label,
  children,
  centered,
}: {
  label: string;
  children: ReactNode;
  centered?: boolean;
}) {
  return (
    <div className={cn("space-y-1", centered && "text-center")}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
      <div className="text-sm leading-relaxed text-foreground">{children}</div>
    </div>
  );
}

/** Renders studio email, phone, and address from SiteConfig.contact only. */
export function StudioContactLinks({
  contact,
  className,
  linkClassName,
  layout = "stack",
  showAddress = true,
  centered = false,
  labeled = true,
}: StudioContactLinksProps) {
  const { locale } = useLocale();
  const isJa = locale === "ja";
  const emailLabel = isJa ? "メール" : "Email";
  const phoneLabel = isJa ? "電話" : "Phone";
  const locationLabel = isJa ? "所在地" : "Location";
  const email = normalizeContactEmail(contact.email);
  const location = contactLocationLabel(contact);
  const blocks: ReactNode[] = [];

  if (hasContactEmail(email)) {
    blocks.push(
      labeled ? (
        <ContactBlock key="email" label={emailLabel} centered={centered}>
          <a
            href={`mailto:${email}`}
            className={cn("break-all transition-colors hover:text-foreground", linkClassName)}
          >
            {email}
          </a>
        </ContactBlock>
      ) : (
        <a
          key="email"
          href={`mailto:${email}`}
          className={cn("break-all transition-colors hover:text-foreground", linkClassName)}
        >
          {email}
        </a>
      ),
    );
  }

  if (hasContactPhone(contact.phone)) {
    blocks.push(
      labeled ? (
        <ContactBlock key="phone" label={phoneLabel} centered={centered}>
          <a
            href={formatPhoneHref(contact.phone)}
            className={cn("transition-colors hover:text-foreground", linkClassName)}
          >
            {contact.phone}
          </a>
        </ContactBlock>
      ) : (
        <a
          key="phone"
          href={formatPhoneHref(contact.phone)}
          className={cn("transition-colors hover:text-foreground", linkClassName)}
        >
          {contact.phone}
        </a>
      ),
    );
  }

  if (showAddress && location) {
    blocks.push(
      labeled ? (
        <ContactBlock key="location" label={locationLabel} centered={centered}>
          <span>{location}</span>
        </ContactBlock>
      ) : (
        <span key="location">{location}</span>
      ),
    );
  }

  if (blocks.length === 0) return null;

  if (layout === "inline") {
    return (
      <div
        className={cn(
          "flex flex-wrap gap-x-6 gap-y-4 text-sm text-muted",
          centered && "justify-center",
          className,
        )}
      >
        {blocks}
      </div>
    );
  }

  return (
    <address
      className={cn(
        labeled ? "space-y-5" : "space-y-2.5 text-sm not-italic leading-relaxed text-muted",
        !labeled && centered && "flex flex-col items-center",
        className,
      )}
    >
      {blocks}
    </address>
  );
}
