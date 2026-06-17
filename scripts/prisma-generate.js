const { execSync, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const myPid = process.pid;

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function stopOtherNodeProcesses() {
  if (process.platform !== "win32") {
    return;
  }

  try {
    execSync(
      `powershell -NoProfile -Command "Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Id -ne ${myPid} } | Stop-Process -Force -ErrorAction SilentlyContinue"`,
      { stdio: "ignore" },
    );
  } catch {
    // ignore
  }
}

stopOtherNodeProcesses();
sleep(1500);

const result = spawnSync("npx", ["prisma", "generate"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
});

if (result.status !== 0) {
  console.error("\nPrisma generate failed. Run these commands in order:");
  console.error("  1. npm run dev:stop");
  console.error("  2. npx prisma generate");
  process.exit(result.status ?? 1);
}
