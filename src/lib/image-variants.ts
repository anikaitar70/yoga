export type ImageVariantSet = {
  full: Buffer;
  medium: Buffer;
  thumbnail: Buffer;
  width: number;
  height: number;
};

const THUMBNAIL_MAX = 400;
const MEDIUM_MAX = 1200;
const FULL_MAX = 2400;
const WEBP_QUALITY = 82;

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
  const image = sharp(buffer, { failOn: "none" }).rotate();
  const metadata = await image.metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;

  const [full, medium, thumbnail] = await Promise.all([
    image
      .clone()
      .resize({ width: FULL_MAX, height: FULL_MAX, fit: "inside", withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer(),
    image
      .clone()
      .resize({ width: MEDIUM_MAX, height: MEDIUM_MAX, fit: "inside", withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer(),
    image
      .clone()
      .resize({ width: THUMBNAIL_MAX, height: THUMBNAIL_MAX, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 78 })
      .toBuffer(),
  ]);

  return { full, medium, thumbnail, width, height };
}
