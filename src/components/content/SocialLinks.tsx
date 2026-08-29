"use client";

import type { SocialLink } from "@/content/types";
import { cn } from "@/lib/utils";

function SocialIcon({ href, label }: { href: string; label: string }) {
  const lowerHref = href.toLowerCase();
  const lowerLabel = label.toLowerCase();
  const isYouTube = lowerHref.includes("youtube") || lowerHref.includes("youtu.be") || lowerLabel.includes("youtube");
  const isFacebook = lowerHref.includes("facebook") || lowerLabel.includes("facebook");
  const isInstagram = lowerHref.includes("instagram") || lowerLabel.includes("instagram");

  if (isYouTube) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="shrink-0">
        <path d="M23.5 12.02c0-1.5-.12-2.65-.36-3.46a3.3 3.3 0 00-2.32-2.32C20.01 5.98 12 5.98 12 5.98s-8.01 0-8.82.26a3.3 3.3 0 00-2.32 2.32C.62 9.37.5 10.52.5 12.02s.12 2.65.36 3.46a3.3 3.3 0 002.32 2.32c.81.26 8.82.26 8.82.26s8.01 0 8.82-.26a3.3 3.3 0 002.32-2.32c.24-.81.36-1.96.36-3.46zM9.75 15.5v-7l6.5 3.5-6.5 3.5z" />
      </svg>
    );
  }

  if (isFacebook) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="shrink-0">
        <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.12 24v-8.44H7.08v-3.49h3.04V9.41c0-3 1.79-4.66 4.52-4.66 1.31 0 2.68.23 2.68.23v2.95h-1.51c-1.49 0-1.95.92-1.95 1.87v2.27h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
      </svg>
    );
  }

  if (isInstagram) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden className="shrink-0">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden className="shrink-0">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  );
}

type SocialLinksProps = {
  links: SocialLink[];
  className?: string;
  linkClassName?: string;
  layout?: "stack" | "inline" | "prominent";
  centered?: boolean;
};

export function SocialLinks({
  links,
  className,
  linkClassName,
  layout = "inline",
  centered = false,
}: SocialLinksProps) {
  const instagramLinks = links.filter((link) => link.href.trim());

  if (instagramLinks.length === 0) return null;

  if (layout === "prominent") {
    return (
      <div
        className={cn(
          "flex flex-col gap-3 sm:flex-row sm:flex-wrap",
          centered && "items-center justify-center",
          className,
        )}
      >
        {instagramLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            title={link.label}
            aria-label={link.label}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-5 py-2.5 text-sm font-semibold text-accent visited:text-accent transition-colors hover:border-accent/50 hover:bg-accent/15",
              linkClassName,
            )}
          >
            <SocialIcon href={link.href} label={link.label} />
            {link.label}
            <span className="sr-only"> (opens in new tab)</span>
          </a>
        ))}
      </div>
    );
  }

  if (layout === "stack") {
    return (
      <ul className={cn("space-y-2.5 text-sm", centered && "text-center", className)}>
        {instagramLinks.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              title={link.label}
              aria-label={link.label}
              className={cn(
                "inline-flex items-center gap-1.5 font-medium text-accent visited:text-accent underline-offset-4 transition-colors hover:text-primary-muted hover:underline",
                linkClassName,
              )}
            >
              <SocialIcon href={link.href} label={link.label} />
              {link.label}
              <span className="sr-only"> (opens in new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-wrap gap-4",
        centered && "justify-center",
        className,
      )}
    >
      {instagramLinks.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          title={link.label}
          aria-label={link.label}
          className={cn(
            "inline-flex items-center gap-1.5 text-sm font-medium text-accent visited:text-accent underline-offset-4 transition-colors hover:text-primary-muted hover:underline",
            linkClassName,
          )}
        >
          <SocialIcon href={link.href} label={link.label} />
          {link.label}
          <span className="sr-only"> (opens in new tab)</span>
        </a>
      ))}
    </div>
  );
}
