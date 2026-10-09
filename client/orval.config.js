const { defineConfig } = require("orval");
const { requireEnv } = require("./scripts/load-env.cjs");

const specUrl = requireEnv("OPENAPI_URL");

/**
 * Orval codegen (`npm run gen:api`). Then `scripts/generate-orval-barrel.mjs`
 * writes `src/api/generated/index.ts` with `buytlyApi`.
 *
 * Generates thin axios clients per OpenAPI tag. React Query hooks
 * belong in app code, not in generated files.
 */
/** @type {import('orval').Config} */
module.exports = defineConfig({
  buytly: {
    input: {
      target: specUrl,
    },
    output: {
      mode: "tags-split",
      target: "./src/api/generated/buytly.ts",
      client: "axios",
      clean: process.env.ORVAL_CLEAN !== "false",
      prettier: true,
      override: {
        mutator: {
          path: "./src/lib/api/custom-instance.ts",
          name: "customInstance",
        },
      },
    },
  },
});
