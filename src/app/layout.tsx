import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { MainLayout } from "@/components/layout/MainLayout";
import { getMetadataBase } from "@/lib/site";
import { fetchSite } from "@/content";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await fetchSite();

  return {
    metadataBase: getMetadataBase(),
    title: {
      default: `${site.name} · Yoga, Art & Lifestyle`,
      template: `%s · ${site.name}`,
    },
    description:
      "A calm studio for yoga, creative practice, and intentional living. Classes, workshops, and community in Portland.",
    keywords: [
      "yoga studio",
      "mindful movement",
      "Portland yoga",
      "restorative yoga",
      "yoga and art",
    ],
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: site.name,
      title: `${site.name} · Yoga, Art & Lifestyle`,
      description:
        "Movement, stillness, and creative living—held with warmth and clarity.",
    },
    twitter: {
      card: "summary_large_image",
      title: site.name,
      description:
        "Yoga, art, and lifestyle—a calm studio community in Portland.",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const site = await fetchSite();

  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${cormorant.variable} h-full`}
    >
      <body className="flex min-h-full flex-col antialiased">
        <MainLayout site={site}>{children}</MainLayout>
      </body>
    </html>
  );
}
