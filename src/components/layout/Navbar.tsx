"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { NavItem } from "@/content/types";
import { BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Container } from "@/components/ui/Container";

type NavbarProps = {
  name: string;
  navigation: NavItem[];
};

export function Navbar({ name, navigation }: NavbarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const nav = navigation;
  const isJustArtPage = pathname?.startsWith("/just-art-life");
  const navbarBrand = isJustArtPage ? "justArtAffaire" : "nirvanaYoga";

  function isJustArtNavItem(item: NavItem) {
    return item.href === "/just-art-life";
  }

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-border/60 bg-background/92 shadow-[0_1px_12px_rgba(42,36,31,0.04)] backdrop-blur-lg"
          : "border-b border-transparent bg-background/80 backdrop-blur-md",
      )}
    >
      <Container className="flex h-[4.25rem] items-center justify-between gap-4 sm:h-[4.75rem]">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="inline-flex shrink-0 items-center transition-opacity hover:opacity-90"
          aria-label={`${name || BRAND_NAME} — home`}
        >
          <BrandLogo brand={navbarBrand} context="navbar" priority />
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={cn(
                "relative rounded-md px-3.5 py-2 text-sm text-muted transition-colors duration-300 hover:text-foreground",
                pathname === item.href && "text-foreground",
              )}
            >
              {isJustArtNavItem(item) ? (
                <BrandLogo
                  brand="justArtAffaire"
                  context="navbar"
                  className="max-w-[8.25rem] align-middle"
                />
              ) : (
                item.label
              )}
              {pathname === item.href ? (
                <span className="absolute inset-x-3 -bottom-px h-px bg-primary/60" aria-hidden />
              ) : null}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border/80 text-foreground transition-colors hover:bg-surface-warm lg:hidden"
          aria-expanded={open ? "true" : "false"}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          {open ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg width="20" height="14" viewBox="0 0 24 18" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              <path d="M0 1h24M0 9h24M0 17h24" />
            </svg>
          )}
        </button>
      </Container>

      <div
        id="mobile-nav"
        className={cn(
          "border-t border-border/60 bg-background/98 backdrop-blur-lg lg:hidden",
          open ? "block" : "hidden",
        )}
      >
        <Container className="flex flex-col gap-1 py-5">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={pathname === item.href ? "page" : undefined}
              className={cn(
                "rounded-md px-4 py-3.5 text-sm text-muted transition-colors hover:bg-surface-warm hover:text-foreground",
                pathname === item.href && "bg-primary-soft/50 text-foreground",
              )}
            >
              {isJustArtNavItem(item) ? (
                <BrandLogo
                  brand="justArtAffaire"
                  context="navbar"
                  className="max-w-[9rem] align-middle"
                />
              ) : (
                item.label
              )}
            </Link>
          ))}
        </Container>
      </div>
    </header>
  );
}
