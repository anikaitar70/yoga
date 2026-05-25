import { formatPhoneHref } from "@/lib/format";
import type { SiteContact } from "@/content/types";

type ContactDetailsProps = {
  showNote?: boolean;
  heading?: string;
  contact: SiteContact;
};

export function ContactDetails({
  showNote = false,
  heading = "Visit & reach us",
  contact,
}: ContactDetailsProps) {

  return (
    <div>
      <h2 className="font-display text-2xl font-medium text-foreground">
        {heading}
      </h2>
      <address className="mt-6 space-y-3 text-sm not-italic leading-relaxed text-muted">
        <p>{contact.address}</p>
        <p>
          <a
            href={`mailto:${contact.email}`}
            className="font-medium text-accent hover:underline"
          >
            {contact.email}
          </a>
        </p>
        <p>
          <a href={formatPhoneHref(contact.phone)} className="hover:text-foreground">
            {contact.phone}
          </a>
        </p>
      </address>
      {showNote ? (
        <p className="mt-8 text-sm text-muted">
          Studio doors open 20 minutes before classes; office replies follow the
          calendar above.
        </p>
      ) : null}
    </div>
  );
}
