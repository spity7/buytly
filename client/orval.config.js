const { defineConfig } = require("orval");
const { requireEnv } = require("./scripts/load-env.cjs");

const specUrl = requireEnv("OPENAPI_URL");

/** @type {import('orval').Config} */
module.exports = defineConfig({
  buytly: {
    input: {
      target: specUrl,
    },
    output: {
      mode: "tags-split",
      target: "./src/api/generated",
      schemas: "./src/api/models",
      client: "react-query",
      httpClient: "axios",
      clean: true,
      prettier: true,
      override: {
        mutator: {
          path: "./src/lib/api/custom-instance.ts",
          name: "customInstance",
        },
        query: {
          useQuery: true,
          useMutation: true,
        },
      },
    },
  },
});
