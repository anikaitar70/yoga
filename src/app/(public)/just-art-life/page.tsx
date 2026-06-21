import type { Metadata } from "next";
import { DynamicProgramPage } from "@/components/content/DynamicProgramPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Just Art Affaire",
  description:
    "My journey with art at Just Art Affaire — from a 2011 hobby to teaching, community in Japan, and a creative space for everyone to explore.",
};

export default function JustArtLifePage() {
  return <DynamicProgramPage pageType="JUST_ART_LIFE" />;
}
