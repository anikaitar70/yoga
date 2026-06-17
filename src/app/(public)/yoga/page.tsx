import type { Metadata } from "next";
import { DynamicProgramPage } from "@/components/content/DynamicProgramPage";

export const metadata: Metadata = {
  title: "Yoga",
  description:
    "My journey of yoga at Nirvana Yoga — asana, pranayama, meditation, and Yoga Nidra rooted in traditional wisdom, accessible for modern life.",
};

export default function YogaPage() {
  return <DynamicProgramPage pageType="YOGA" />;
}
