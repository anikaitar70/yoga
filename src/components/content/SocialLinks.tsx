"use client";

import type { SocialLink } from "@/content/types";
import { cn } from "@/lib/utils";

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
            className={cn(
              "inline-flex items-center justify-center rounded-full border border-accent/30 bg-accent/10 px-5 py-2.5 text-sm font-semibold text-accent transition-colors hover:border-accent/50 hover:bg-accent/15",
              linkClassName,
            )}
          >
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
              className={cn(
                "font-medium text-accent underline-offset-4 transition-colors hover:text-primary-muted hover:underline",
                linkClassName,
              )}
            >
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
          className={cn(
            "text-sm font-medium text-accent underline-offset-4 transition-colors hover:text-primary-muted hover:underline",
            linkClassName,
          )}
        >
          {link.label}
          <span className="sr-only"> (opens in new tab)</span>
        </a>
      ))}
    </div>
  );
}
