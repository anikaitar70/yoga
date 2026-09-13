#!/usr/bin/env node
/**
 * sync-live.js — make localhost match https://nirvanayoga.org
 * Pulls public live data (events/blogs/gallery) via public APIs and
 * upserts into local DB. Also downloads /uploads/* files that are missing locally.
 *
 * This is a *partial* sync (only public APIs). For 100% parity (SiteConfig,
 * PageSections, Hero, About, private galleries) do a full DB dump:
 *   ssh vps "cd ~/yoga && ./deploy/backup-database.sh && ls -t backups/db/*.gz | head -1"
 *   scp vps:~/yoga/backups/db/yoga_*.sql.gz /tmp/live.sql.gz
 *   gunzip -c /tmp/live.sql.gz | psql postgresql://postgres:postgres@localhost:5433/yoga
 *   rsync -avz vps:~/yoga/public/uploads/ public/uploads/
 *
 * Usage: npm run sync:live   or   node scripts/sync-live.js [--live https://nirvanayoga.org] [--download-uploads]
 */
const fs = require("node:fs");
const path = require("node:path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const root = path.join(__dirname, "..");

const LIVE = (process.env.LIVE_URL || process.argv.find((a) => a.startsWith("--live="))?.split("=")[1] || "https://nirvanayoga.org").replace(/\/$/, "");
const DOWNLOAD_UPLOADS = process.argv.includes("--download-uploads") || process.argv.includes("--with-uploads");

function log(m) { console.log(`[sync-live] ${m}`); }
function warn(m) { console.warn(`[sync-live] ⚠ ${m}`); }

async function fetchJson(p) {
  const url = `${LIVE}${p}`;
  log(`GET ${url}`);
  const r = await fetch(url, { headers: { Accept: "application/json" } });
  if (!r.ok) throw new Error(`GET ${url} -> ${r.status} ${r.statusText}`);
  return r.json();
}

async function downloadUpload(urlPath) {
  if (!urlPath || !urlPath.startsWith("/uploads/")) return;
  const dest = path.join(root, "public", urlPath);
  if (fs.existsSync(dest)) return;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const url = `${LIVE}${urlPath}`;
  try {
    const r = await fetch(url);
    if (!r.ok) { warn(`skip ${urlPath}: ${r.status}`); return; }
    const buf = Buffer.from(await r.arrayBuffer());
    fs.writeFileSync(dest, buf);
    log(`downloaded ${urlPath} (${(buf.length/1024).toFixed(0)}KB)`);

    // also try webp variants for gallery
    for (const suffix of ["-thumb.webp", "-medium.webp", "-full.webp"]) {
      // already full, skip dup
    }
  } catch (e) {
    warn(`download ${urlPath} failed: ${e.message}`);
  }
}

async function syncEvents() {
  const remote = await fetchJson("/api/events");
  log(`Live events: ${remote.length}`);
  let updated = 0, created = 0;
  for (const r of remote) {
    if (!r.slug) continue;
    const data = {
      title: String(r.title || r.slug),
      description: String(r.description || ""),
      location: String(r.location || ""),
      startsAt: new Date(r.startsAt),
      endsAt: r.endsAt ? new Date(r.endsAt) : null,
      imageUrl: r.imageUrl ? String(r.imageUrl) : null,
      imageAlt: r.imageAlt ? String(r.imageAlt) : null,
      externalUrl: r.externalUrl ? String(r.externalUrl) : null,
      eventDetail: r.eventDetail ?? null,
      price: r.price != null ? Number(r.price) : null,
      category: String(r.category || "YOGA"),
      isFeatured: Boolean(r.isFeatured),
      published: r.published ?? true,
      seoTitle: r.seoTitle || null,
      metaDescription: r.metaDescription || null,
      ogImageUrl: r.ogImageUrl || null,
      canonicalUrlOverride: r.canonicalUrlOverride || null,
      focusKeywords: Array.isArray(r.focusKeywords) ? r.focusKeywords : [],
      isSpecialEvent: Boolean(r.isSpecialEvent),
      specialEventTocMode: r.specialEventTocMode || "AUTOMATIC",
      specialEventTocOverride: r.specialEventTocOverride ?? null,
      sortOrder: r.sortOrder ?? 0,
      // jaLocale etc not exposed publicly; keep local
    };
    if (data.imageUrl) await downloadUpload(data.imageUrl);
    // eventDetail may contain section imageUrls
    if (data.eventDetail?.sections) {
      for (const s of data.eventDetail.sections) {
        if (s.imageUrl) await downloadUpload(s.imageUrl);
        if (s.imageSrc) await downloadUpload(s.imageSrc);
      }
    }

    const existing = await prisma.event.findUnique({ where: { slug: r.slug } });
    if (existing) {
      await prisma.event.update({ where: { slug: r.slug }, data });
      updated++;
    } else {
      await prisma.event.create({ data: { slug: r.slug, ...data } });
      created++;
    }
  }
  // optionally delete local slugs that don't exist live? keep them for now.
  log(`Events: ${created} created, ${updated} updated (total ${remote.length})`);
}

async function syncBlogs() {
  try {
    const remote = await fetchJson("/api/blogs");
    log(`Live blogs: ${remote.length}`);
    let c = 0, u = 0;
    for (const r of remote) {
      if (!r.slug) continue;
      const data = {
        title: String(r.title || r.slug),
        summary: String(r.summary || ""),
        content: String(r.content || ""),
        coverImageUrl: r.coverImageUrl ? String(r.coverImageUrl) : null,
        tags: Array.isArray(r.tags) ? r.tags : [],
        published: r.published ?? true,
        seoTitle: r.seoTitle || null,
        metaDescription: r.metaDescription || null,
      };
      if (data.coverImageUrl) await downloadUpload(data.coverImageUrl);
      const ex = await prisma.blogPost.findUnique({ where: { slug: r.slug } });
      if (ex) { await prisma.blogPost.update({ where: { slug: r.slug }, data }); u++; }
      else { await prisma.blogPost.create({ data: { slug: r.slug, ...data } }); c++; }
    }
    log(`Blogs: ${c} created, ${u} updated`);
  } catch (e) {
    warn(`blogs sync skip: ${e.message}`);
  }
}

async function syncGallery() {
  try {
    const remote = await fetchJson("/api/gallery");
    // gallery endpoint returns array of images + maybe collections/collages
    const items = Array.isArray(remote) ? remote : remote.items || remote.images || [];
    log(`Live gallery items: ${items.length}`);
    let c = 0, u = 0;
    for (const r of items) {
      if (!r.id) continue;
      await downloadUpload(r.url);
      await downloadUpload(r.thumbnailUrl);
      await downloadUpload(r.mediumUrl);
      const data = {
        title: String(r.title || ""),
        url: String(r.url),
        altText: String(r.altText || ""),
        description: String(r.description || ""),
        category: r.category || null,
        isPublished: r.isPublished ?? true,
        featuredOnHomepage: r.featuredOnHomepage ?? false,
        sortOrder: r.sortOrder ?? 0,
        width: r.width ?? null,
        height: r.height ?? null,
      };
      const ex = await prisma.galleryImage.findUnique({ where: { id: r.id } });
      if (ex) { await prisma.galleryImage.update({ where: { id: r.id }, data }); u++; }
      else {
        try {
          await prisma.galleryImage.create({ data: { id: r.id, ...data } });
          c++;
        } catch (e) {
          warn(`gallery create ${r.id}: ${e.message.slice(0,120)}`);
        }
      }
    }
    log(`Gallery: ${c} created, ${u} updated`);
  } catch (e) {
    warn(`gallery sync skip: ${e.message}`);
  }
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.error("Refusing to sync-live in production.");
    process.exit(1);
  }
  const localUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5433/yoga";
  log(`LIVE=${LIVE}  LOCAL=${new URL(localUrl).host}`);
  if (DOWNLOAD_UPLOADS) log("Will download missing /uploads/* files");

  await syncEvents();
  await syncBlogs();
  await syncGallery();

  log("Partial live sync done. For 100% parity (PageSections/Hero/SiteConfig) do a full DB dump:");
  console.log(`  ssh your-vps "cd ~/yoga && ./deploy/backup-database.sh"`);
  console.log(`  scp your-vps:~/yoga/backups/db/yoga_*.sql.gz /tmp/live.sql.gz`);
  console.log(`  gunzip -c /tmp/live.sql.gz | psql ${localUrl}`);
  console.log(`  rsync -avz your-vps:~/yoga/public/uploads/ public/uploads/`);
  console.log(`Then restart: npm start`);
}

main().catch((e)=>{ console.error(e); process.exit(1); }).finally(()=>prisma.$disconnect());
