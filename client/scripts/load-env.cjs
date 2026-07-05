const path = require("path");
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

module.exports = { loadEnv, requireEnv, clientDir };
