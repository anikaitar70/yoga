import type { SiteContact, SocialLink } from "@/content/types";
import { StudioContactLinks } from "@/components/content/StudioContactLinks";
import { SocialLinks } from "@/components/content/SocialLinks";

type ContactDetailsProps = {
  showNote?: boolean;
  heading?: string;
  contact: SiteContact;
  social?: SocialLink[];
};

export function ContactDetails({
  showNote = false,
  heading = "Visit & reach us",
  contact,
  social = [],
}: ContactDetailsProps) {
  return (
    <div>
      <h2 className="font-display text-2xl font-medium text-foreground">{heading}</h2>
      <div className="mt-6">
        <StudioContactLinks contact={contact} labeled linkClassName="font-medium text-accent hover:underline" />
      </div>
      {social.length > 0 ? (
        <div className="mt-8">
          <h3 className="text-sm font-medium uppercase tracking-wide text-muted">Instagram</h3>
          <SocialLinks links={social} layout="prominent" className="mt-4" />
        </div>
      ) : null}
      {showNote ? (
        <p className="mt-8 text-sm text-muted">
          Studio doors open 20 minutes before classes; office replies follow the calendar above.
        </p>
      ) : null}
    </div>
  );
}
