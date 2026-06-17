import type { Metadata } from "next";
import { DynamicProgramPage } from "@/components/content/DynamicProgramPage";

export const metadata: Metadata = {
  title: "Healing",
  description:
    "My journey into healing at Nirvana Yoga — from Reiki at fifteen to 15+ years guiding others toward inner balance, awareness, and transformation.",
};

export default function HealingPage() {
  return <DynamicProgramPage pageType="HEALING" />;
}
