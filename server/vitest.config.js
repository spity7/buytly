import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.js"],
    setupFiles: ["./tests/setup.js"],
    fileParallelism: false,
    testTimeout: 15000,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.js"],
      exclude: ["src/server.js", "src/app.js"],
    },
  },
});
