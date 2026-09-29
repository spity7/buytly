const { spawn } = require("child_process");
const path = require("path");
const { main } = require("./gen-api.cjs");
const { clientDir, resolvePackageBin } = require("./load-env.cjs");

async function start() {
  try {
    await main();
  } catch (err) {
    console.warn(`[dev] Initial API codegen skipped: ${err.message}`);
    console.warn(
      "[dev] Using committed generated files. Start the server and save a swagger file to regenerate.",
    );
  }

  const concurrentlyBin = resolvePackageBin(clientDir, "concurrently");
  const nextBin = resolvePackageBin(clientDir, "next");
  const watchCmd = `"${process.execPath}" scripts/watch-api.cjs --skip-initial`;
  const nextCmd = `"${process.execPath}" "${nextBin}" dev`;

  const child = spawn(
    process.execPath,
    [
      concurrentlyBin,
      "-k",
      "-n",
      "api,next",
      "-c",
      "yellow,cyan",
      watchCmd,
      nextCmd,
    ],
    { cwd: clientDir, stdio: "inherit" },
  );

  child.on("exit", (code) => process.exit(code ?? 0));
}

start();
