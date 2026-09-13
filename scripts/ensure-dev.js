#!/usr/bin/env node
/**
 * ensure-dev.js — makes `npm run dev` / `npm start` just work.
 *
 * Checks/fixes (in order):
 *  1. .env exists (copies from .env.example if missing)
 *  2. DATABASE_URL reachable (pg connect timeout 3s)
 *  3. Docker daemon + `db` container (tries without sudo, then with sudo)
 *  4. Waits for postgres pg_isready loop (60s)
 *  5. Prisma client fresh (handles EPERM lock like dev-clean.js)
 *  6. `prisma db push` + `ensure-db-schema.js` patches
 *  7. Seeds if DB empty (optional)
 *
 * Safe in production: if DATABASE_URL host is `db` (docker network) it skips
 * docker host-fixes and only does prisma checks.
 * Exit 0 = ready, 1 = needs manual intervention (prints steps).
 */

const { execSync, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const isProdEnv = process.env.NODE_ENV === "production";

function log(msg) {
  console.log(`[ensure-dev] ${msg}`);
}
function warn(msg) {
  console.warn(`[ensure-dev] ⚠ ${msg}`);
}
function err(msg) {
  console.error(`[ensure-dev] ✖ ${msg}`);
}
function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

// 1. Load .env (manual, no dotenv dep)
function loadDotEnv() {
  const envPath = path.join(root, ".env");
  const examplePath = path.join(root, ".env.example");
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(examplePath)) {
      warn(".env missing — copying from .env.example (edit DATABASE_URL/ADMIN_SECRET after).");
      try {
        fs.copyFileSync(examplePath, envPath);
        log(`Created ${envPath} from example.`);
      } catch (e) {
        err(`Failed to copy .env.example: ${e.message}`);
        return;
      }
    } else {
      warn(".env not found and no .env.example.");
      return;
    }
  }
  try {
    const content = fs.readFileSync(envPath, "utf8");
    for (const rawLine of content.split("\n")) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      let val = line.slice(eq + 1).trim();
      // strip quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = val;
    }
  } catch (e) {
    warn(`Failed to load .env: ${e.message}`);
  }
}
loadDotEnv();

function getDatabaseUrl() {
  return process.env.DATABASE_URL || "";
}
function parseDatabaseUrl(urlStr) {
  try {
    const u = new URL(urlStr);
    return {
      host: u.hostname,
      port: u.port ? parseInt(u.port, 10) : 5432,
      user: decodeURIComponent(u.username),
      database: u.pathname.replace(/^\//, "").split("?")[0],
      url: urlStr,
    };
  } catch {
    return null;
  }
}

// pg connection test (no native pg_isready needed)
async function canConnect(urlStr, timeoutMs = 3000) {
  let pg;
  try {
    pg = require("pg");
  } catch {
    // fallback: try spawn pg_isready if pg package not available
    try {
      execSync(`pg_isready -h ${parseDatabaseUrl(urlStr)?.host || "localhost"} -p ${parseDatabaseUrl(urlStr)?.port || 5433} -t 2`, {
        stdio: "ignore",
        timeout: timeoutMs,
      });
      return true;
    } catch {
      return false;
    }
  }
  const client = new pg.Client({ connectionString: urlStr, connectionTimeoutMillis: timeoutMs });
  try {
    await client.connect();
    await client.query("SELECT 1");
    await client.end();
    return true;
  } catch {
    try { await client.end().catch(() => {}); } catch {}
    return false;
  }
}

function findDockerBin() {
  const candidates = ["docker", "/snap/bin/docker", "/usr/bin/docker"];
  for (const c of candidates) {
    try {
      execSync(`command -v ${c} >/dev/null 2>&1`, { stdio: "ignore", shell: true });
      return c;
    } catch {}
    try {
      execSync(`${c} --version >/dev/null 2>&1`, { stdio: "ignore", shell: true });
      return c;
    } catch {}
  }
  // last try: which docker
  try {
    const out = execSync("which docker 2>/dev/null || echo ''", { shell: true }).toString().trim();
    if (out) return out;
  } catch {}
  return null;
}

function run(cmd, opts = {}) {
  const { allowSudoRetry = false, ...rest } = opts;
  try {
    return execSync(cmd, { stdio: "pipe", encoding: "utf8", timeout: 15000, shell: true, ...rest });
  } catch (e) {
    const out = (e.stdout || "") + (e.stderr || "") + (e.message || "");
    if (allowSudoRetry && /permission denied/i.test(out)) {
      // retry with sudo — use inherit so user can type password in the terminal
      const sudoCmd = cmd.startsWith("sudo ") ? cmd : `sudo ${cmd}`;
      log(`Permission denied — retrying with sudo: ${sudoCmd} (enter password if prompted)`);
      try {
        const result = spawnSync(sudoCmd, { stdio: "inherit", shell: true, ...rest });
        if (result.status === 0) {
          // re-run original cmd now that sudo may have cached credentials, or just return empty success
          // for checks we need output — try again without sudo wrapper since auth now cached
          try {
            return execSync(cmd, { stdio: "pipe", encoding: "utf8", timeout: 15000, shell: true, ...rest });
          } catch {
            return "";
          }
        }
        throw new Error(`sudo ${cmd} exited ${result.status}`);
      } catch (e2) {
        throw e2;
      }
    }
    throw e;
  }
}

function dockerDaemonOk(dockerBin) {
  try {
    run(`${dockerBin} info >/dev/null 2>&1`, { allowSudoRetry: true });
    return true;
  } catch {
    return false;
  }
}

function tryStartDockerDaemon(dockerBin) {
  log("Docker daemon not responding — trying to start it...");
  const cmds = [
    "sudo snap start docker",
    "sudo systemctl start docker",
    "sudo service docker start",
  ];
  for (const c of cmds) {
    try {
      // use inherit so sudo password prompt is visible
      const r = spawnSync(c, { stdio: "inherit", shell: true, timeout: 30000 });
      if (r.status === 0) {
        sleep(2000);
        if (dockerDaemonOk(dockerBin)) {
          log(`Docker daemon started via: ${c}`);
          return true;
        }
      }
    } catch {}
  }
  return dockerDaemonOk(dockerBin);
}

function isDbContainerRunning(dockerBin) {
  try {
    const out = run(`${dockerBin} compose ps --format json 2>/dev/null || ${dockerBin} compose ps 2>/dev/null || ${dockerBin} ps --format "{{.Names}} {{.Status}}"`, {
      allowSudoRetry: true,
    });
    return /db/i.test(out) && /(Up|healthy|running)/i.test(out);
  } catch {
    return false;
  }
}

function startDbContainer(dockerBin) {
  log(`Starting postgres via: ${dockerBin} compose up -d db`);
  try {
    // use inherit so sudo password prompt works; run handles permission retry with inherit
    const result = spawnSync(`${dockerBin} compose up -d db`, { stdio: "inherit", shell: true });
    if (result.status === 0) return true;
    // if plain failed due to permission, run will have retried with sudo inherit — try explicit sudo
    const sudoResult = spawnSync(`sudo ${dockerBin} compose up -d db`, { stdio: "inherit", shell: true });
    return sudoResult.status === 0;
  } catch (e) {
    const msg = (e.stdout || "") + (e.stderr || "") + e.message;
    err(`docker compose up failed: ${msg.slice(0, 800)}`);
    return false;
  }
}

async function waitForDb(urlStr, maxMs = 60000) {
  const parsed = parseDatabaseUrl(urlStr);
  log(`Waiting for postgres at ${parsed ? `${parsed.host}:${parsed.port}/${parsed.database}` : urlStr} (up to ${maxMs / 1000}s)...`);
  const start = Date.now();
  let attempt = 0;
  while (Date.now() - start < maxMs) {
    attempt += 1;
    if (await canConnect(urlStr, 3000)) {
      log(`Postgres reachable after ${Math.round((Date.now() - start) / 1000)}s.`);
      return true;
    }
    if (attempt % 5 === 0) process.stdout.write(`  ... still waiting (${Math.round((Date.now() - start) / 1000)}s)\n`);
    sleep(2000);
  }
  return false;
}

function ensurePrismaClient() {
  const clientDir = path.join(root, "node_modules", ".prisma", "client");
  const exists = fs.existsSync(path.join(clientDir, "index.js"));
  if (!exists) {
    log("Prisma client missing — generating...");
  } else {
    // quick stale check similar to src/lib/prisma.ts REQUIRED_DELEGATES
    try {
      const c = require(path.join(clientDir, "index.js"));
      // existence is enough; stale detection needs runtime, we just regenerate if schema changed recently
      const schemaMtime = fs.statSync(path.join(root, "prisma/schema.prisma")).mtimeMs;
      const clientMtime = fs.statSync(path.join(clientDir, "index.js")).mtimeMs;
      if (clientMtime < schemaMtime) {
        log("Prisma schema newer than client — regenerating...");
      } else {
        return true;
      }
    } catch {
      log("Prisma client check failed — regenerating...");
    }
  }
  for (let attempt = 1; attempt <= 3; attempt++) {
    const r = spawnSync("npx", ["prisma", "generate"], { cwd: root, stdio: "inherit", shell: true });
    if (r.status === 0) {
      log("Prisma client generated.");
      return true;
    }
    if (attempt < 3) {
      warn(`prisma generate failed (attempt ${attempt}/3), killing stale next dev locks...`);
      try { execSync('pkill -f "next dev" || true', { stdio: "ignore", shell: true }); } catch {}
      sleep(2000);
    }
  }
  err("prisma generate failed. Close other terminals running `next dev` and run: npx prisma generate");
  return false;
}

function ensureSchema() {
  log("Pushing database schema (prisma db push)...");
  const r = spawnSync("npx", ["prisma", "db", "push", "--skip-generate"], {
    cwd: root,
    stdio: "inherit",
    shell: true,
  });
  if (r.status !== 0) {
    warn("prisma db push failed (DB may already be in sync or unreachable).");
    return false;
  }
  log("Running lightweight patches (ensure-db-schema.js)...");
  const r2 = spawnSync("node", ["scripts/ensure-db-schema.js"], { cwd: root, stdio: "inherit", shell: true });
  if (r2.status !== 0) warn("ensure-db-schema.js had warnings (see above).");
  return true;
}

async function maybeSeed(urlStr) {
  // check if SiteConfig empty -> seed
  let pg;
  try { pg = require("pg"); } catch { return; }
  const client = new pg.Client({ connectionString: urlStr, connectionTimeoutMillis: 3000 });
  try {
    await client.connect();
    const res = await client.query('SELECT COUNT(*)::int as c FROM "SiteConfig"');
    const c = res.rows[0]?.c ?? 0;
    await client.end();
    if (c === 0) {
      log("Empty DB detected (SiteConfig count 0) — seeding...");
      const r = spawnSync("npx", ["prisma", "db", "seed"], { cwd: root, stdio: "inherit", shell: true });
      if (r.status === 0) log("Seed completed.");
      else warn("Seed failed — run manually: npm run db:seed");
    }
  } catch (e) {
    try { await client.end().catch(() => {}); } catch {}
    // table may not exist yet — ignore
  }
}

async function main() {
  const urlStr = getDatabaseUrl();
  if (!urlStr) {
    err("DATABASE_URL not set in .env. Copy .env.example -> .env and set it.");
    process.exit(1);
  }
  const parsed = parseDatabaseUrl(urlStr);
  log(`DATABASE_URL host=${parsed?.host}:${parsed?.port} db=${parsed?.database}`);

  // Production / docker-network mode: host is `db`, not localhost — don't try host docker fixes
  const isDockerNetworkHost = parsed && parsed.host === "db";
  const isLocalhost = parsed && (parsed.host === "localhost" || parsed.host === "127.0.0.1");

  // fast path
  if (await canConnect(urlStr, 2000)) {
    log("DB already reachable — skipping docker start.");
  } else {
    if (isDockerNetworkHost) {
      err(`Cannot reach DB at ${parsed.host}:${parsed.port} inside container network.`);
      err("If running locally, set DATABASE_URL to localhost:5433 in .env. If running in Docker, ensure `docker compose up -d db` is healthy.");
      process.exit(1);
    }
    if (!isLocalhost) {
      err(`Cannot reach DB at ${parsed.host}:${parsed.port}. Check DATABASE_URL and network.`);
      process.exit(1);
    }

    // localhost path — try docker
    const dockerBin = findDockerBin();
    if (!dockerBin) {
      err("DB unreachable and `docker` not found.");
      console.error(`
  Fix one of:
   1) Install/start docker and run:  sudo /snap/bin/docker compose up -d db
      (this repo now maps db 5433:5432 in docker-compose.yml:43)
   2) Install native postgres:
      sudo apt update && sudo apt install -y postgresql postgresql-contrib
      sudo systemctl enable --now postgresql
      sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
      sudo -u postgres createdb -O postgres yoga || true
      # then set .env DATABASE_URL to ...@localhost:5432/yoga
  Then re-run: npm run dev
`);
      process.exit(1);
    }
    log(`Found docker: ${dockerBin}`);

    if (!dockerDaemonOk(dockerBin)) {
      if (!tryStartDockerDaemon(dockerBin)) {
        err("Docker daemon still not responding. Try manually:");
        console.error(`  sudo snap start docker && sudo ${dockerBin} info`);
        console.error(`  sudo ${dockerBin} compose up -d db`);
        process.exit(1);
      }
    } else {
      log("Docker daemon OK.");
    }

    if (!isDbContainerRunning(dockerBin)) {
      if (!startDbContainer(dockerBin)) {
        err("Failed to start db container. Check docker logs:");
        console.error(`  sudo ${dockerBin} compose logs db`);
        process.exit(1);
      }
      // give healthcheck time
      sleep(3000);
    } else {
      log("db container already running.");
    }

    if (!(await waitForDb(urlStr, 70000))) {
      err(`DB still unreachable at ${parsed.host}:${parsed.port} after 70s.`);
      console.error(`
  Debug:
    sudo ${dockerBin} compose ps
    sudo ${dockerBin} compose logs db --tail 100
    ss -tlnp | grep 5433
    sudo ${dockerBin} inspect --format='{{json .State.Health.Status}}' yoga-db-1
  Try:
    sudo ${dockerBin} compose restart db
    # or reset: sudo ${dockerBin} compose down && sudo ${dockerBin} compose up -d db
`);
      process.exit(1);
    }
  }

  // DB is reachable — ensure prisma/schema
  if (!ensurePrismaClient()) {
    // non-fatal, continue
  }
  ensureSchema();
  await maybeSeed(urlStr);

  // final verify
  if (!(await canConnect(urlStr, 2000))) {
    err("DB reachable earlier but now failing final check.");
    process.exit(1);
  }
  log("✓ DB ready.");
}

if (require.main === module) {
  main().catch((e) => {
    err(e.stack || e.message);
    process.exit(1);
  });
} else {
  module.exports = { main };
}
