"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { NavItem } from "@/content/types";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/Container";

type NavbarProps = {
  name: string;
  navigation: NavItem[];
};

export function Navbar({ name, navigation }: NavbarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav = navigation;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4 sm:h-[4.25rem]">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="font-display text-lg font-semibold tracking-tight text-foreground sm:text-xl"
        >
          {name}
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={cn(
                "rounded-sm px-3 py-2 text-sm text-muted transition-colors hover:text-foreground",
                pathname === item.href && "text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-border text-foreground lg:hidden"
          aria-expanded={open ? "true" : "false"}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          {open ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              aria-hidden
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg
              width="20"
              height="14"
              viewBox="0 0 24 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              aria-hidden
            >
              <path d="M0 1h24M0 9h24M0 17h24" />
            </svg>
          )}
        </button>
      </Container>

      <div
        id="mobile-nav"
        className={cn(
          "border-t border-border bg-background lg:hidden",
          open ? "block" : "hidden",
        )}
      >
        <Container className="flex flex-col gap-1 py-4">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={pathname === item.href ? "page" : undefined}
              className={cn(
                "rounded-sm px-3 py-3 text-sm text-muted hover:bg-accent-soft hover:text-foreground",
                pathname === item.href && "bg-accent-soft text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </Container>
      </div>
    </header>
  );
}
