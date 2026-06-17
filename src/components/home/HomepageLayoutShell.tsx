import type { ReactNode } from "react";
import { fetchSite } from "@/content";
import {
  DEFAULT_HOMEPAGE_SPACING,
  homepageLayoutToCssVariables,
  type HomepageLayoutSettings,
} from "@/lib/homepage-layout";

type HomepageLayoutShellProps = {
  children: ReactNode;
};

export async function HomepageLayoutShell({ children }: HomepageLayoutShellProps) {
  const site = await fetchSite();
  const spacing =
    (site.homepageLayout as HomepageLayoutSettings | undefined) ?? DEFAULT_HOMEPAGE_SPACING;

  return <div style={homepageLayoutToCssVariables(spacing)}>{children}</div>;
}

