import type { Metadata } from "next";
import { Caveat, Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

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
      className={`${dmSans.variable} ${cormorant.variable} ${caveat.variable} h-full`}
    >
      <body className="flex min-h-full flex-col antialiased">{children}</body>
    </html>
  );
}
