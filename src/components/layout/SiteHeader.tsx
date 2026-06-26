"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import type { NavItem } from "@/content/types";
import { BRAND_NAME } from "@/lib/brand";
import { filterPublicNavigation } from "@/lib/site-navigation";
import { useDesignSettings } from "@/components/design/DesignSettingsProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Container } from "@/components/ui/Container";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";

export type SiteHeaderProps = {
  name: string;
  navigation: NavItem[];
  /** Current path for active nav styling (live site only). */
  pathname?: string;
  /** When false, render static markup — no Next.js links (admin preview). */
  interactive?: boolean;
};

export function SiteHeader({
  name,
  navigation,
  pathname = "/",
  interactive = true,
}: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { headerLayout, navigationStyling } = useDesignSettings();
  const { localizePath } = useLocale();
  const nav = filterPublicNavigation(navigation);
  const isJustArtPage = interactive && pathname.startsWith("/just-art-life");
  const navbarBrand = isJustArtPage ? "justArtAffaire" : "nirvanaYoga";

  useEffect(() => {
    if (!interactive || !open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, interactive]);

  useEffect(() => {
    if (!interactive) return;
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [interactive]);

  const logoStyle = {
    marginLeft: `${headerLayout.leftOffsetPx}px`,
    marginRight: `${headerLayout.rightOffsetPx}px`,
    transform:
      headerLayout.alignment === "custom"
        ? `translateX(${headerLayout.customOffsetX}px)`
        : undefined,
  };

  const logoDimensions = {
    widthPx: headerLayout.logoWidthPx > 0 ? headerLayout.logoWidthPx : undefined,
    heightPx: headerLayout.logoHeightPx > 0 ? headerLayout.logoHeightPx : undefined,
  };

  const logoContent = (
    <BrandLogo
      brand={navbarBrand}
      context="navbar"
      priority={interactive}
      widthPx={logoDimensions.widthPx}
      heightPx={logoDimensions.heightPx}
    />
  );

  const logoNode: ReactNode = interactive ? (
    <Link
      href={localizePath("/")}
      onClick={() => setOpen(false)}
      className="inline-flex shrink-0 items-center transition-opacity hover:opacity-90"
      style={logoStyle}
      aria-label={`${name || BRAND_NAME} — home`}
    >
      {logoContent}
    </Link>
  ) : (
    <div className="inline-flex shrink-0 items-center" style={logoStyle} aria-hidden>
      {logoContent}
    </div>
  );

  const desktopNav = (
    <nav
      className={cn("site-nav items-center", interactive ? "hidden lg:flex" : "flex")}
      style={{ gap: `${headerLayout.headerGapPx}px` }}
      aria-label="Primary"
    >
      {nav.map((item) =>
        interactive ? (
          <Link
            key={item.href}
            href={item.href}
            aria-current={pathname === item.href ? "page" : undefined}
            className="relative rounded-md px-3.5 py-2 transition-colors duration-300"
          >
            {item.label}
            {pathname === item.href ? (
              <span className="absolute inset-x-3 -bottom-px h-px bg-primary/60" aria-hidden />
            ) : null}
          </Link>
        ) : (
          <span
            key={item.href}
            className="relative rounded-md px-3.5 py-2"
            aria-current={item.href === "/" ? "page" : undefined}
          >
            {item.label}
          </span>
        ),
      )}
    </nav>
  );

  const mobileToggle = interactive ? (
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
  ) : null;

  const customHeaderBar = Boolean(
    navigationStyling.backgroundColor || navigationStyling.borderColor,
  );
  const headerBarStyle = {
    ...(navigationStyling.backgroundColor
      ? { backgroundColor: navigationStyling.backgroundColor }
      : {}),
    ...(navigationStyling.borderColor ? { borderColor: navigationStyling.borderColor } : {}),
  };

  return (
    <header
      className={cn(
        "site-header-bar",
        interactive
          ? cn(
              "sticky top-0 z-50 transition-all duration-500",
              customHeaderBar
                ? "border-b"
                : scrolled
                  ? "border-b border-border/60 bg-background/92 shadow-[0_1px_12px_rgba(42,36,31,0.04)] backdrop-blur-lg"
                  : "border-b border-transparent bg-background/80 backdrop-blur-md",
            )
          : customHeaderBar
            ? "relative z-10 border-b"
            : "relative z-10 border-b border-border/60 bg-background/95",
      )}
      style={customHeaderBar ? headerBarStyle : undefined}
    >
      <Container
        className={cn(
          "flex h-[4.25rem] items-center sm:h-[4.75rem]",
          headerLayout.alignment === "center"
            ? "grid grid-cols-[1fr_auto_1fr] gap-4"
            : headerLayout.alignment === "right"
              ? "flex-row-reverse justify-between gap-4"
              : "justify-between gap-4",
        )}
      >
        {headerLayout.alignment === "center" ? (
          <>
            <div className={interactive ? "hidden lg:block" : undefined} />
            <div className="flex justify-center">{logoNode}</div>
            <div className="flex items-center justify-end gap-2">
              {desktopNav}
              <LanguageSwitcher compact className="hidden lg:inline-flex" />
              {mobileToggle}
            </div>
          </>
        ) : (
          <>
            {logoNode}
            <div className="hidden items-center gap-2 lg:flex">
              {desktopNav}
              <LanguageSwitcher compact />
            </div>
            {mobileToggle}
          </>
        )}
      </Container>

      {interactive ? (
        <div
          id="mobile-nav"
          className={cn(
            "site-nav border-t border-border/60 bg-background/98 backdrop-blur-lg lg:hidden",
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
                className="rounded-md px-4 py-3.5 transition-colors hover:bg-surface-warm"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 border-t border-border/50 px-4 pt-4">
              <LanguageSwitcher />
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
