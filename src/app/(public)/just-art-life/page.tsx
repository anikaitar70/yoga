import type { Metadata } from "next";
import { DynamicProgramPage } from "@/components/content/DynamicProgramPage";
import { buildStaticPageMetadata } from "@/lib/seo/build-static-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata("just-art-life");
}

export default function JustArtLifePage() {
  return <DynamicProgramPage pageType="JUST_ART_LIFE" />;
}
