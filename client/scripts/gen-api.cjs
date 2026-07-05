const { spawnSync } = require("child_process");
const fs = require("fs");
const http = require("http");
const path = require("path");
const { requireEnv, clientDir } = require("./load-env.cjs");

const specUrl = requireEnv("OPENAPI_URL");

function isServerUp() {
  return new Promise((resolve) => {
    const req = http.get(specUrl, (res) => {
      res.resume();
      resolve(res.statusCode === 200);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForServer(maxAttempts = 15, delayMs = 500) {
  for (let i = 0; i < maxAttempts; i++) {
    if (await isServerUp()) return true;
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return false;
}

function resolveOrvalBin() {
  const candidates = [
    path.join(clientDir, "node_modules", "orval", "dist", "bin", "orval.js"),
    path.join(clientDir, "node_modules", "orval", "dist", "bin", "orval.mjs"),
  ];
  const found = candidates.find((p) => fs.existsSync(p));
  if (!found) {
    throw new Error("Orval binary not found — run npm install in client/");
  }
  return found;
}

function runOrval() {
  const orvalBin = resolveOrvalBin();
  const result = spawnSync(
    process.execPath,
    [orvalBin, "--config", "orval.config.js"],
    {
      cwd: clientDir,
      encoding: "utf8",
    },
  );

  if (result.status !== 0) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    throw new Error("Orval generation failed");
  }
}

function runBarrel() {
  const barrelScript = path.join(
    clientDir,
    "scripts",
    "generate-orval-barrel.mjs",
  );
  const result = spawnSync(process.execPath, [barrelScript], {
    cwd: clientDir,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    throw new Error("Orval barrel generation failed");
  }
}

async function main({ quiet = false } = {}) {
  const serverReady = await waitForServer();

  if (!serverReady) {
    throw new Error(
      `API not reachable at ${specUrl} — start the server first (cd server && npm run dev)`,
    );
  }

  if (!quiet) {
    console.log(`[gen:api] Regenerating from ${specUrl}`);
  }

  runOrval();
  runBarrel();

  if (!quiet) {
    console.log("[gen:api] Done");
  }
}

module.exports = { main, waitForServer, specUrl };

if (require.main === module) {
  main().catch((err) => {
    console.error(`[gen:api] ${err.message}`);
    process.exit(1);
  });
}
