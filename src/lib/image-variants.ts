export type ImageVariantSet = {
  full: Buffer;
  medium: Buffer;
  thumbnail: Buffer;
  width: number;
  height: number;
};

const THUMBNAIL_MAX = 400;
const MEDIUM_MAX = 1200;
const FULL_MAX = 2048;
const WEBP_QUALITY = 80;

function variantFilename(baseFilename: string, suffix: string): string {
  const dot = baseFilename.lastIndexOf(".");
  const stem = dot >= 0 ? baseFilename.slice(0, dot) : baseFilename;
  return `${stem}-${suffix}.webp`;
}

export function imageVariantFilenames(baseFilename: string) {
  return {
    full: variantFilename(baseFilename, "full"),
    medium: variantFilename(baseFilename, "medium"),
    thumbnail: variantFilename(baseFilename, "thumb"),
  };
}

export async function generateImageVariants(buffer: Buffer): Promise<ImageVariantSet> {
  const { default: sharp } = await import("sharp");

  const base = () =>
    sharp(buffer, { failOn: "none", sequentialRead: true, limitInputPixels: 40_000_000 }).rotate();

  const metadata = await base().metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;

  const toVariant = (max: number, quality: number) =>
    base()
      .resize({ width: max, height: max, fit: "inside", withoutEnlargement: true })
      .webp({ quality, effort: 4 })
      .toBuffer();

  // Sequential — avoids three parallel decodes overloading a small VPS.
  const thumbnail = await toVariant(THUMBNAIL_MAX, 78);
  const medium = await toVariant(MEDIUM_MAX, WEBP_QUALITY);
  const full = await toVariant(FULL_MAX, WEBP_QUALITY);

  return { full, medium, thumbnail, width, height };
}
