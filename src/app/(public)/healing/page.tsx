import type { Metadata } from "next";
import { DynamicProgramPage } from "@/components/content/DynamicProgramPage";
import { ScrollFigures } from "@/components/program/ScrollFigures";
import { buildStaticPageMetadata } from "@/lib/seo/build-static-metadata";
import { fetchScrollFiguresScene } from "@/content/repositories/animation-scenes";

export async function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata("healing");
}

export default async function HealingPage() {
  const scrollFigures = await fetchScrollFiguresScene("HEALING");

  return (
    <>
      {scrollFigures.isEnabled ? (
        <ScrollFigures
          images={scrollFigures.config.images}
          horizontalOffsetPercent={scrollFigures.config.horizontalOffsetPercent}
          opacity={scrollFigures.config.opacity}
          tintColor={scrollFigures.config.tintColor}
        />
      ) : null}
      <DynamicProgramPage pageType="HEALING" />
    </>
  );
}
