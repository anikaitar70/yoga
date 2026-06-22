import { fetchAboutPreview, fetchSite } from "@/content";
import { AboutPreviewSectionView } from "@/components/home/HomepageSectionViews";
import { resolveHomepageAboutImageSide, resolveHomepageSectionLayouts } from "@/lib/homepage-layout";

export async function AboutPreview() {
  const [about, site] = await Promise.all([fetchAboutPreview(), fetchSite()]);
  const sectionLayouts = resolveHomepageSectionLayouts(site.homepageLayout);

  return (
    <AboutPreviewSectionView
      about={{
        ...about,
        imageSide: resolveHomepageAboutImageSide(about),
      }}
      layout={sectionLayouts["about-preview"]}
    />
  );
}
