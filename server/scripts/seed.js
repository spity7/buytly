#!/usr/bin/env node
import { runSeed } from "./seed/run.js";

const reset = process.argv.includes("--reset");
const password = process.env.SEED_PASSWORD || "BuytlyDemo2026!";

runSeed({ reset, password }).catch((error) => {
  console.error("[seed] failed:", error.message);
  process.exit(1);
});
