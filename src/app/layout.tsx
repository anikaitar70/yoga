import type { Metadata, Viewport } from "next";
import { Caveat } from "next/font/google";
import { ALL_SITE_FONT_CLASS_NAMES, JAPANESE_FONT_VARIABLES } from "@/lib/site-fonts-loader";
import { getLocale } from "@/lib/i18n/server";
import "./globals.css";

const caveat = Caveat({
  variable: "--font-handwritten",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8f6f2",
};

export const metadata: Metadata = {
  verification: {
    google: "4wfy5ASQt4OtcfbZH9nUPxyKhFWAcstRz3-ngR7Hpq8",
  },
  icons: {
    icon: [{ url: "/bookmark_icon.jpeg", type: "image/jpeg" }],
    apple: [{ url: "/bookmark_icon.jpeg", type: "image/jpeg" }],
    shortcut: ["/bookmark_icon.jpeg"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${ALL_SITE_FONT_CLASS_NAMES} ${JAPANESE_FONT_VARIABLES} ${caveat.variable} h-full`}
    >
      <body className="flex min-h-full flex-col antialiased">{children}</body>
    </html>
  );
}
