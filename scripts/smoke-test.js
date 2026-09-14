#!/usr/bin/env node
/**
 * smoke-test.js — post-deploy smoke test for DB-backed pages
 * Usage:
 *   APP_URL=https://nirvanayoga.org node scripts/smoke-test.js
 *   # or npm run deploy:smoke
 *   # Local: APP_URL=http://localhost:3000 node scripts/smoke-test.js
 *
 * Checks that real pages return 200 and contain expected markers, not just /api/health.
 * /api/health is liveness only (no DB) and was green while the site was broken (P2022).
 */
const https = require("node:https");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

// Load .env for APP_URL if not already set
try {
  if (!process.env.APP_URL && !process.env.NEXT_PUBLIC_SITE_URL) {
    const envPath = path.join(__dirname, "..", ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      for (const line of content.split("\n")) {
        const t = line.trim();
        if (!t || t.startsWith("#")) continue;
        const eq = t.indexOf("=");
        if (eq === -1) continue;
        const k = t.slice(0, eq).trim();
        let v = t.slice(eq + 1).trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
        if (!(k in process.env)) process.env[k] = v;
      }
    }
  }
} catch {}

const APP_URL = process.env.APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const TIMEOUT_MS = 30000;

const PAGES = [
  { path: "/", marker: /Nirvana Yoga|Movement, stillness/i, desc: "Home" },
  { path: "/just-art-life", marker: /My Journey with Art|Creative life/i, desc: "Just Art page" },
  { path: "/events", marker: /Events|Upcoming/i, desc: "Events" },
  { path: "/ja/just-art-life", marker: /My Journey|Art/i, desc: "Just Art JA" },
  { path: "/ja/events", marker: /Events|イベント/i, desc: "Events JA" },
  { path: "/api/health", marker: /"ok":true/i, desc: "Health (liveness)" },
];

function fetchUrl(urlStr) {
  return new Promise((resolve, reject) => {
    const lib = urlStr.startsWith("https:") ? https : http;
    const req = lib.get(urlStr, { timeout: TIMEOUT_MS }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
    });
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy(new Error(`Timeout after ${TIMEOUT_MS}ms for ${urlStr}`));
    });
  });
}

async function main() {
  const base = APP_URL.replace(/\/$/, "");
  console.log(`[smoke] Testing ${base} ...`);
  let failed = 0;

  for (const page of PAGES) {
    const url = `${base}${page.path}`;
    try {
      const { status, body } = await fetchUrl(url);
      if (status !== 200) {
        console.error(`[smoke] ✖ ${page.desc} ${page.path}: expected 200, got ${status}`);
        failed++;
        continue;
      }
      if (page.marker && !page.marker.test(body)) {
        console.error(`[smoke] ✖ ${page.desc} ${page.path}: 200 but marker not found (/ ${page.marker.source} /)`);
        // also check for Prisma error leak (should never happen in production, but P2022 was the recent bug)
        if (/P2022|column.*does not exist|prisma/i.test(body)) {
          console.error(`[smoke]   Detected DB error in body (P2022/column)`);
        }
        failed++;
        continue;
      }
      if (/P2022|column.*does not exist/i.test(body)) {
        console.error(`[smoke] ✖ ${page.desc} ${page.path}: body contains DB error (P2022)`);
        failed++;
        continue;
      }
      console.log(`[smoke] ✓ ${page.desc} ${page.path} — ${status}`);
    } catch (e) {
      console.error(`[smoke] ✖ ${page.desc} ${page.path}: fetch failed — ${e.message}`);
      failed++;
    }
  }

  // Also grep docker logs for recent P2022 if running on VPS with docker
  try {
    const { spawnSync } = require("node:child_process");
    const r = spawnSync("docker", ["compose", "logs", "--tail", "50", "app"], { encoding: "utf8", timeout: 5000, shell: true });
    const logs = (r.stdout || "") + (r.stderr || "");
    if (/P2022/.test(logs)) {
      console.error("[smoke] ✖ Docker logs contain P2022 (missing column) — DB drift still present");
      failed++;
    }
  } catch {}

  if (failed > 0) {
    console.error(`[smoke] ${failed} check(s) failed — site may be broken (see above). /api/health being green is not sufficient.`);
    process.exit(1);
  }
  console.log("[smoke] All checks passed — real pages are DB-healthy.");
}

if (require.main === module) main().catch((e) => { console.error(e); process.exit(1); });
