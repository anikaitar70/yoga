#!/usr/bin/env node
/**
 * start.js — smart entry for `npm start`.
 * - In production (NODE_ENV=production) -> `next start` (requires `npm run build`).
 * - In development -> `next dev` (faster, matches user's usual `npm run dev`).
 * - If .next missing in production, falls back to `next dev` with a warning.
 * Uses ensure-dev.js to auto-fix DB before launching.
 */
const { spawn, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");

function log(msg) {
  console.log(`[start] ${msg}`);
}

async function ensure() {
  // run ensure-dev.js synchronously with inherited stdio so user sees progress + can enter sudo password
  const r = spawnSync("node", [path.join(__dirname, "ensure-dev.js")], {
    cwd: root,
    stdio: "inherit",
    shell: true,
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

async function main() {
  await ensure();

  const isProd = process.env.NODE_ENV === "production";
  const hasBuild = fs.existsSync(path.join(root, ".next", "BUILD_ID")) || fs.existsSync(path.join(root, ".next", "standalone", "server.js"));

  let cmd = "next";
  let args = ["dev"];

  if (isProd) {
    if (hasBuild) {
      args = ["start"];
      log("NODE_ENV=production + .next found -> next start");
    } else {
      log("NODE_ENV=production but no .next build found — falling back to next dev (run `npm run build` for production).");
      args = ["dev"];
    }
  } else {
    log("Development mode -> next dev (use NODE_ENV=production npm start for production)");
  }

  const child = spawn("npx", [cmd, ...args], { cwd: root, stdio: "inherit", shell: true });
  child.on("exit", (code, sig) => {
    if (sig) process.kill(process.pid, sig);
    else process.exit(code ?? 0);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
