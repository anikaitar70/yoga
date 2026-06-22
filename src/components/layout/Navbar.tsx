"use client";

import { usePathname } from "next/navigation";
import type { NavItem } from "@/content/types";
import { SiteHeader } from "@/components/layout/SiteHeader";

type NavbarProps = {
  name: string;
  navigation: NavItem[];
};

export function Navbar({ name, navigation }: NavbarProps) {
  const pathname = usePathname() ?? "/";

  return <SiteHeader name={name} navigation={navigation} pathname={pathname} interactive />;
}
