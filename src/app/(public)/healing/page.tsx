import type { Metadata } from "next";
import { DynamicProgramPage } from "@/components/content/DynamicProgramPage";
import { buildStaticPageMetadata } from "@/lib/seo/build-static-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata("healing");
}

export default function HealingPage() {
  return <DynamicProgramPage pageType="HEALING" />;
}
