import type { Metadata } from "next";
import { HelpClient } from "@/components/help/HelpClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Help & Documentation — Admin",
  robots: { index: false, follow: false },
};

export default function AdminHelpPage() {
  return <HelpClient />;
}
