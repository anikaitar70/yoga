import type { Metadata } from "next";
import { DynamicProgramPage } from "@/components/content/DynamicProgramPage";
import { ScrollFigures } from "@/components/program/ScrollFigures";
import { buildStaticPageMetadata } from "@/lib/seo/build-static-metadata";
import { fetchScrollFiguresScene } from "@/content/repositories/animation-scenes";

export async function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata("just-art-life");
}

export default async function JustArtLifePage() {
  const scrollFigures = await fetchScrollFiguresScene("JUST_ART_LIFE");

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
      <DynamicProgramPage pageType="JUST_ART_LIFE" />
    </>
  );
}
