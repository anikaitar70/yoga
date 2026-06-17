import { fetchAboutPreview } from "@/content";
import { AboutPreviewSectionView } from "@/components/home/HomepageSectionViews";
import { resolveHomepageAboutImageSide } from "@/lib/homepage-layout";

export async function AboutPreview() {
  const about = await fetchAboutPreview();
  return (
    <AboutPreviewSectionView
      about={{
        ...about,
        imageSide: resolveHomepageAboutImageSide(about),
      }}
    />
  );
}
