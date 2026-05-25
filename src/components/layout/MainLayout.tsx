import type { SiteConfig } from "@/content";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

type MainLayoutProps = {
  children: React.ReactNode;
  site: SiteConfig;
};

export function MainLayout({ children, site }: MainLayoutProps) {
  return (
    <>
      <Navbar name={site.name} navigation={site.navigation} />
      <main className="flex-1">{children}</main>
      <Footer site={site} />
    </>
  );
}
