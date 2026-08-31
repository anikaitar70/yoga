"use client";

import Link from "next/link";
import { useEffect, useState, useRef, type ReactNode } from "react";
import type { NavItem } from "@/content/types";
import { BRAND_NAME } from "@/lib/brand";
import { filterPublicNavigation, SECONDARY_NAV_HREFS } from "@/lib/site-navigation";
import { useDesignSettings } from "@/components/design/DesignSettingsProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Container } from "@/components/ui/Container";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { stripLocalePrefix } from "@/lib/i18n/locale";

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
  const secondarySet = new Set<string>(SECONDARY_NAV_HREFS as unknown as string[]);
  const isSecondaryHref = (href: string) => secondarySet.has(stripLocalePrefix(href));
  const primaryNav = nav.filter((item) => !isSecondaryHref(item.href));
  const secondaryNav = nav.filter((item) => isSecondaryHref(item.href));
  const pathWithoutLocale = stripLocalePrefix(pathname);
  const isJustArtPage = interactive && pathWithoutLocale.startsWith("/just-art-life");
  const navbarBrand = isJustArtPage ? "justArtAffaire" : "nirvanaYoga";

  const drawerRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!interactive || !open) return;
    const prev = document.body.style.overflow;
    // Only lock scroll on mobile where the panel covers the viewport
    if (window.innerWidth < 1024) {
      document.body.style.overflow = "hidden";
    }

    // Focus trap
    const drawer = drawerRef.current;
    if (drawer) {
      const focusable = drawer.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length > 0) {
        (focusable[0] as HTMLElement).focus();
      }
    }

    const currentHamburger = hamburgerRef.current;
    return () => {
      document.body.style.overflow = prev;
      currentHamburger?.focus();
    };
  }, [open, interactive]);

  useEffect(() => {
    if (!interactive || !open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      
      if (event.key === "Tab") {
        const drawer = drawerRef.current;
        if (!drawer) return;
        const focusable = Array.from(
          drawer.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        ) as HTMLElement[];
        
        if (focusable.length === 0) {
            event.preventDefault();
            return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === first) {
            event.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, interactive]);

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
      className={cn("site-nav flex-nowrap items-center", interactive ? "hidden lg:flex" : "flex")}
      style={{ gap: `${headerLayout.headerGapPx}px` }}
      aria-label="Primary"
    >
      {primaryNav.map((item) =>
        interactive ? (
          <Link
            key={item.href}
            href={item.href}
            aria-current={pathname === item.href ? "page" : undefined}
            className="relative whitespace-nowrap rounded-md px-3.5 py-2 transition-colors duration-300"
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
      ref={hamburgerRef}
      className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border/80 text-foreground transition-colors hover:bg-surface-warm"
      aria-expanded={open ? "true" : "false"}
      aria-controls="mobile-nav"
      aria-haspopup="menu"
      aria-label={open ? "Close menu" : "Open menu"}
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
          role="menu"
          ref={drawerRef}
          className={cn(
            "border-t border-border/60 bg-background/98 backdrop-blur-lg",
            "absolute left-0 right-0 top-full shadow-lg lg:left-auto lg:right-4 lg:mt-2 lg:w-80 lg:rounded-xl lg:border lg:shadow-xl",
            open
              ? "block max-h-[calc(100dvh-4.25rem)] overflow-y-auto overscroll-contain sm:max-h-[calc(100dvh-4.75rem)] lg:max-h-[70vh]"
              : "hidden",
          )}
        >
          <Container className="flex flex-col gap-1 py-5 lg:px-2">
            <div className="mb-2 px-4 pb-3 lg:hidden">
              <LanguageSwitcher />
            </div>
            {/* Mobile: primary + secondary; Desktop: secondary only (primary already visible) */}
            <nav className="site-nav flex flex-col gap-1 lg:hidden" aria-label="Mobile primary">
              {primaryNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  role="menuitem"
                  aria-current={pathname === item.href ? "page" : undefined}
                  className="rounded-md px-4 py-3.5 transition-colors hover:bg-surface-warm"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            {primaryNav.length > 0 && secondaryNav.length > 0 ? (
              <div className="mx-4 my-2 border-t border-border/40 lg:hidden" aria-hidden />
            ) : null}
            <nav className="site-nav flex flex-col gap-1" aria-label="More">
              <p className="px-4 py-1 text-xs font-semibold uppercase tracking-widest text-muted/70">More</p>
              {secondaryNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  role="menuitem"
                  aria-current={pathname === item.href ? "page" : undefined}
                  className="rounded-md px-4 py-3.5 transition-colors hover:bg-surface-warm"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
