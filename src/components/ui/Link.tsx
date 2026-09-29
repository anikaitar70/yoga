import NextLink from "next/link";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";

type LinkProps = ComponentPropsWithoutRef<typeof NextLink>;

/**
 * Thin wrapper around next/link's Link with suppressHydrationWarning baked in.
 * Browser extensions (e.g. antivirus "SkinChecked" scanners) inject attributes
 * like bis_skin_checked onto every anchor before React hydrates, which next/link
 * forwards straight onto the <a> it renders. suppressHydrationWarning tells React
 * to ignore that one element's attribute diff instead of logging a false-positive
 * hydration mismatch for it. See https://react.dev/link/hydration-mismatch.
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(props, ref) {
  return <NextLink ref={ref} suppressHydrationWarning {...props} />;
});

export default Link;
