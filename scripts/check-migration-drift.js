#!/usr/bin/env node
/**
 * check-migration-drift.js — fail if DB schema has drifted from prisma/schema.prisma
 * Usage:
 *   DATABASE_URL=postgresql://... npx prisma migrate diff --from-url $DATABASE_URL --to-schema-datamodel prisma/schema.prisma --script
 *   node scripts/check-migration-drift.js
 *   # or npm run db:check-drift
 *
 * Exit 0 = no drift, 1 = drift detected (needs migration), 2 = error
 * This should be run:
 *  - locally before pushing schema changes (prevents the "dev db push masks drift" bug)
 *  - in CI / pre-deploy against the real DATABASE_URL
 *  - inside the freshly built Docker image with DATABASE_URL pointing at prod (via migrate diff)
 */
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

// Load .env if DATABASE_URL not already in env (for local `npm run db:check-drift`)
try {
  if (!process.env.DATABASE_URL) {
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

function runDiff(databaseUrl) {
  const result = spawnSync(
    "npx",
    [
      "prisma",
      "migrate",
      "diff",
      "--from-url",
      databaseUrl,
      "--to-schema-datamodel",
      "prisma/schema.prisma",
      "--script",
    ],
    { encoding: "utf8", shell: true, timeout: 30000 }
  );
  return result;
}

function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("[drift] DATABASE_URL not set — cannot check drift.");
    process.exit(2);
  }

  console.log("[drift] Checking DB vs prisma/schema.prisma...");
  const result = runDiff(url);

  if (result.error) {
    console.error("[drift] Failed to run prisma migrate diff:", result.error.message);
    console.error(result.stdout || "");
    console.error(result.stderr || "");
    process.exit(2);
  }

  const stdout = (result.stdout || "").trim();
  const stderr = (result.stderr || "").trim();

  if (result.status !== 0) {
    console.error("[drift] prisma migrate diff failed (exit", result.status + ")");
    if (stdout) console.error(stdout);
    if (stderr) console.error(stderr);
    process.exit(2);
  }

  // Prisma prints "-- This is an empty migration." when no drift
  const isEmpty =
    stdout.includes("This is an empty migration") ||
    stdout === "" ||
    stdout.trim() === "-- This is an empty migration.";

  if (isEmpty) {
    console.log("[drift] ✓ No drift — DB matches schema and migrations.");
    process.exit(0);
  }

  console.error("[drift] ✖ Drift detected — DB does not match schema. Create a migration:");
  console.error("  npx prisma migrate dev --name describe_the_change");
  console.error("  # or for review: npx prisma migrate dev --create-only --name ...");
  console.error("");
  console.error("Diff SQL (apply via migration, not db push):");
  console.error("---");
  console.error(stdout || stderr);
  console.error("---");
  process.exit(1);
}

if (require.main === module) main();
