/**
 * Copy community testimonial images and wire them to:
 * - Homepage (Testimonial model)
 * - Yoga & Healing program pages (PageSection TESTIMONIALS payload)
 *
 * Run: node prisma/seed-community-testimonials.js
 * Source folder: ./testimonials (project root)
 */
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const SOURCE_DIR = path.join(__dirname, "..", "testimonials");
const UPLOAD_DIR = path.join(__dirname, "..", "public", "uploads", "testimonials");

const IMAGE_EXT = /\.(jpe?g|png|webp)$/i;

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function titleCase(value) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function parseFilename(filename) {
  const base = filename.replace(IMAGE_EXT, "").trim();

  if (/^whatsapp image/i.test(base)) {
    const index = base.match(/\((\d+)\)/)?.[1] ?? (base.replace(/\D/g, "") || "1");
    return {
      slug: `whatsapp-${index}`,
      name: "Community member",
      role: "",
      imageAlt: "Community testimonial",
    };
  }

  const dashMatch = base.match(/^(.+?)\s*-\s*(.+)$/);
  if (dashMatch) {
    const name = dashMatch[1].trim();
    const role = titleCase(dashMatch[2].trim());
    return {
      slug: slugify(name),
      name,
      role,
      imageAlt: `${name}${role ? ` — ${role}` : ""} testimonial`,
    };
  }

  const words = base.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    const last = words[words.length - 1];
    const name = words.slice(0, -1).join(" ");
    return {
      slug: slugify(name || base),
      name: name || base,
      role: titleCase(last),
      imageAlt: `${name || base} — ${titleCase(last)} testimonial`,
    };
  }

  return {
    slug: slugify(base),
    name: base,
    role: "",
    imageAlt: `${base} testimonial`,
  };
}

function copyTestimonialImages() {
  if (!fs.existsSync(SOURCE_DIR)) {
    throw new Error(`Source folder not found: ${SOURCE_DIR}`);
  }

  fs.mkdirSync(UPLOAD_DIR, { recursive: true });

  const files = fs
    .readdirSync(SOURCE_DIR)
    .filter((file) => IMAGE_EXT.test(file))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  if (files.length === 0) {
    throw new Error(`No images found in ${SOURCE_DIR}`);
  }

  const usedSlugs = new Set();
  const items = [];

  for (const file of files) {
    const parsed = parseFilename(file);
    let slug = parsed.slug || "testimonial";
    let suffix = 2;
    while (usedSlugs.has(slug)) {
      slug = `${parsed.slug || "testimonial"}-${suffix}`;
      suffix += 1;
    }
    usedSlugs.add(slug);

    const ext = path.extname(file).toLowerCase();
    const destName = `${slug}${ext}`;
    const destPath = path.join(UPLOAD_DIR, destName);

    fs.copyFileSync(path.join(SOURCE_DIR, file), destPath);

    const imageUrl = `/uploads/testimonials/${destName}`;
    items.push({
      name: parsed.name,
      role: parsed.role,
      imageUrl,
      imageAlt: parsed.imageAlt,
    });
  }

  return items;
}

function toPageSectionItems(items) {
  return items.map((item) => ({
    name: item.name || undefined,
    role: item.role || undefined,
    imageUrl: item.imageUrl,
    imageAlt: item.imageAlt,
  }));
}

async function updateProgramPageTestimonials(pageType, items) {
  const sections = await prisma.pageSection.findMany({
    where: { pageType, sectionType: "TESTIMONIALS" },
    orderBy: { sortOrder: "asc" },
  });

  if (sections.length === 0) {
    console.log(`No TESTIMONIALS section on ${pageType} — create one in /admin/pages first.`);
    return;
  }

  const payload = { items: toPageSectionItems(items) };

  for (const section of sections) {
    await prisma.pageSection.update({
      where: { id: section.id },
      data: { payload, isPublished: true },
    });
  }

  console.log(`Updated ${sections.length} testimonial section(s) on ${pageType} (${items.length} images).`);
}

async function seedHomepageTestimonials(items) {
  await prisma.testimonial.deleteMany({
    where: {
      OR: [
        { imageUrl: { not: null } },
        { name: { in: ["Maya Chen", "Jordan Ellis", "Sofia Ruiz"] } },
      ],
    },
  });

  await prisma.testimonial.createMany({
    data: items.map((item) => ({
      quote: "",
      name: item.name,
      role: item.role,
      imageUrl: item.imageUrl,
      imageAlt: item.imageAlt,
      status: "APPROVED",
    })),
  });

  console.log(`Homepage: seeded ${items.length} image testimonials.`);
}

async function main() {
  const items = copyTestimonialImages();
  console.log(`Copied ${items.length} images to public/uploads/testimonials/`);

  await seedHomepageTestimonials(items);
  await updateProgramPageTestimonials("YOGA", items);
  await updateProgramPageTestimonials("HEALING", items);

  console.log("Community testimonials seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
