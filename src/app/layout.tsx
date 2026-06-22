import type { Metadata } from "next";
import { Caveat } from "next/font/google";
import { ALL_SITE_FONT_CLASS_NAMES } from "@/lib/site-fonts-loader";
import "./globals.css";

const caveat = Caveat({
  variable: "--font-handwritten",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ALL_SITE_FONT_CLASS_NAMES} ${caveat.variable} h-full`}
    >
      <body className="flex min-h-full flex-col antialiased">{children}</body>
    </html>
  );
}
