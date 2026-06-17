#!/bin/sh
# Verify every DB-referenced local image path exists on disk.
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "Ensuring app container is running..."
docker compose up -d app >/dev/null

echo "Verifying DB-referenced media paths..."
docker compose exec -T app node - <<'NODE'
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function collectLocalImageUrls(value, out) {
  if (!value) return;
  if (typeof value === "string") {
    if (
      value.startsWith("/uploads/") ||
      value.startsWith("/brand/") ||
      value === "/bookmark_icon.jpeg"
    ) {
      out.add(value);
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectLocalImageUrls(item, out));
    return;
  }
  if (typeof value === "object") {
    Object.values(value).forEach((item) => collectLocalImageUrls(item, out));
  }
}

async function main() {
  const localUrls = new Set();

  const [events, blogPosts, galleryImages, testimonials, heroSections, aboutPages, pageSections, siteConfigs] =
    await Promise.all([
      prisma.event.findMany({ select: { imageUrl: true } }),
      prisma.blogPost.findMany({ select: { coverImageUrl: true } }),
      prisma.galleryImage.findMany({ select: { url: true, thumbnailUrl: true, mediumUrl: true } }),
      prisma.testimonial.findMany({ select: { imageUrl: true } }),
      prisma.heroSection.findMany({ select: { imageSrc: true, rotatingImages: true } }),
      prisma.aboutPage.findMany({ select: { imageSrc: true } }),
      prisma.pageSection.findMany({ select: { imageUrl: true, payload: true } }),
      prisma.siteConfig.findMany({ select: { branding: true, homepageSections: true } }),
    ]);

  events.forEach((row) => collectLocalImageUrls(row.imageUrl, localUrls));
  blogPosts.forEach((row) => collectLocalImageUrls(row.coverImageUrl, localUrls));
  galleryImages.forEach((row) => {
    collectLocalImageUrls(row.url, localUrls);
    collectLocalImageUrls(row.thumbnailUrl, localUrls);
    collectLocalImageUrls(row.mediumUrl, localUrls);
  });
  testimonials.forEach((row) => collectLocalImageUrls(row.imageUrl, localUrls));
  heroSections.forEach((row) => {
    collectLocalImageUrls(row.imageSrc, localUrls);
    collectLocalImageUrls(row.rotatingImages, localUrls);
  });
  aboutPages.forEach((row) => collectLocalImageUrls(row.imageSrc, localUrls));
  pageSections.forEach((row) => {
    collectLocalImageUrls(row.imageUrl, localUrls);
    collectLocalImageUrls(row.payload, localUrls);
  });
  siteConfigs.forEach((row) => {
    collectLocalImageUrls(row.branding, localUrls);
    collectLocalImageUrls(row.homepageSections, localUrls);
  });

  const sortedUrls = [...localUrls].sort();
  const missing = [];
  const present = [];

  sortedUrls.forEach((url) => {
    const diskPath = path.join("/app/public", url.replace(/^\//, ""));
    if (fs.existsSync(diskPath)) present.push(url);
    else missing.push(url);
  });

  const uploads = sortedUrls.filter((url) => url.startsWith("/uploads/"));
  const brands = sortedUrls.filter((url) => url.startsWith("/brand/"));
  const favicon = sortedUrls.filter((url) => url === "/bookmark_icon.jpeg");

  const report = {
    checkedLocalDbImagePaths: sortedUrls.length,
    foundOnDisk: present.length,
    missingOnDisk: missing.length,
    uploadPathsInDb: uploads.length,
    brandPathsInDb: brands.length,
    faviconPathInDbOrPayload: favicon.length,
    missingPaths: missing,
  };

  console.log(JSON.stringify(report, null, 2));

  if (missing.length > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
NODE
