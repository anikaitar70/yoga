const { execSync, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const nextDir = path.join(root, ".next");
const prismaClientDir = path.join(root, "node_modules", ".prisma", "client");

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function stopOtherNodeProcesses() {
  const myPid = process.pid;
  console.log("Stopping other Node processes (keeps this script running)...");

  if (process.platform === "win32") {
    try {
      execSync(
        `powershell -NoProfile -Command "Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Id -ne ${myPid} } | Stop-Process -Force -ErrorAction SilentlyContinue"`,
        { stdio: "ignore" },
      );
    } catch {
      // No matching processes — fine.
    }
    return;
  }

  try {
    execSync(`pkill -f "next dev" || true`, { stdio: "ignore", shell: true });
  } catch {
    // ignore
  }
}

function prismaClientExists() {
  return fs.existsSync(path.join(prismaClientDir, "index.js"));
}

function runPrismaGenerate() {
  const result = spawnSync("npx", ["prisma", "generate"], {
    cwd: root,
    stdio: "inherit",
    shell: true,
  });
  return result.status === 0;
}

function regeneratePrismaClient() {
  const maxAttempts = 4;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    console.log(`Regenerating Prisma client (attempt ${attempt}/${maxAttempts})...`);

    if (runPrismaGenerate()) {
      console.log("Prisma client regenerated.");
      return true;
    }

    if (attempt === maxAttempts) {
      break;
    }

    console.log("Prisma engine file is locked — stopping Node processes and retrying...");
    stopOtherNodeProcesses();
    sleep(2000);
  }

  if (prismaClientExists()) {
    console.warn(
      "Warning: prisma generate failed (EPERM — file locked), but an existing client was found.",
    );
    console.warn("Continuing with the current Prisma client. If you changed schema.prisma, close");
    console.warn("all terminals running `npm run dev`, then run: npx prisma generate");
    return false;
  }

  console.error("Prisma generate failed and no client exists. Close all Node/Next processes and retry.");
  process.exit(1);
}

console.log("Preparing clean dev start...");
stopOtherNodeProcesses();
sleep(1500);

console.log("Clearing .next cache...");
fs.rmSync(nextDir, { recursive: true, force: true });

console.log("Syncing database schema...");
spawnSync("npx", ["prisma", "db", "push", "--skip-generate"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
});
spawnSync("node", ["scripts/ensure-db-schema.js"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
});

regeneratePrismaClient();

console.log("Starting dev server...");
const dev = spawnSync("npx", ["next", "dev"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
});

process.exit(dev.status ?? 1);
