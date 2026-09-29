const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

const clientDir = path.join(__dirname, "..");

const dotenvOptions = { quiet: true };

function loadEnv() {
  dotenv.config({
    path: path.join(clientDir, ".env"),
    ...dotenvOptions,
  });
  dotenv.config({
    path: path.join(clientDir, ".env.local"),
    override: true,
    ...dotenvOptions,
  });
}

function requireEnv(name) {
  loadEnv();
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is required — set it in apps/buildwise-web/.env.local (see .env.example)`,
    );
  }
  return value;
}

/** Resolve a package CLI entry (local node_modules, then monorepo root). */
function resolvePackageBin(appDir, packageName) {
  let dir = appDir;
  for (;;) {
    const pkgPath = path.join(dir, "node_modules", packageName, "package.json");
    if (fs.existsSync(pkgPath)) {
      const pkg = require(pkgPath);
      const binRel =
        typeof pkg.bin === "string"
          ? pkg.bin
          : pkg.bin?.[packageName] || Object.values(pkg.bin || {})[0];
      if (!binRel) {
        throw new Error(`No bin field in ${packageName}`);
      }
      const binPath = path.join(path.dirname(pkgPath), binRel);
      if (!fs.existsSync(binPath)) {
        throw new Error(`Binary missing for ${packageName}: ${binPath}`);
      }
      return binPath;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(
    `${packageName} not found — from repo root run npm install, or: cd ${appDir} && npm install --no-workspaces`,
  );
}

module.exports = { loadEnv, requireEnv, clientDir, resolvePackageBin };
