const path = require("path");
const chokidar = require("chokidar");
const { main, specUrl } = require("./gen-api.cjs");

const repoRoot = path.join(__dirname, "../..");

const watchPaths = [
  path.join(repoRoot, "server/src/config/swagger.js"),
  path.join(repoRoot, "server/src/config/swagger.schemas.js"),
  path.join(repoRoot, "server/src/modules/**/*.routes.js"),
  path.join(repoRoot, "server/src/routes/index.js"),
];

let debounceTimer;

function regenerate(reason) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    console.log(`[api-watch] ${reason}`);
    try {
      await main({ quiet: true });
      console.log("[api-watch] Regenerated");
    } catch (err) {
      console.error(`[api-watch] ${err.message}`);
    }
  }, 800);
}

main()
  .then(() => {
    console.log(`[api-watch] Ready — watching swagger files`);
  })
  .catch((err) => {
    console.error(`[api-watch] ${err.message}`);
    console.error("[api-watch] Will retry when a swagger file changes");
  });

chokidar
  .watch(watchPaths, { ignoreInitial: true })
  .on("all", (_event, filePath) => {
    regenerate(`Regenerating (${path.relative(repoRoot, filePath)})`);
  });
