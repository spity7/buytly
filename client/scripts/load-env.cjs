const path = require("path");
const fs = require("fs");
const Module = require("module");
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
      `${name} is required — set it in client/.env.local (see .env.example)`,
    );
  }
  return value;
}

/** Resolve a package CLI entry (works with npm workspaces hoisting). */
function resolvePackageBin(appDir, packageName) {
  const req = Module.createRequire(path.join(appDir, "package.json"));
  let pkgPath;
  try {
    pkgPath = req.resolve(`${packageName}/package.json`);
  } catch {
    throw new Error(
      `${packageName} not found — from repo root run npm install, or: cd ${appDir} && npm install --no-workspaces`,
    );
  }
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

module.exports = { loadEnv, requireEnv, clientDir, resolvePackageBin };
