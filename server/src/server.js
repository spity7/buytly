import app from "./app.js";
import { env, isSwaggerEnabled } from "./config/env.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { siteService } from "./modules/sites/site.service.js";
import { ensureCatalogIndexes } from "./modules/catalog/catalog.indexes.js";
import { ensureUserIndexes } from "./modules/users/user.indexes.js";

const publicBaseUrl = env.API_URL.replace(/\/api\/v1\/?$/, "");

const startServer = async () => {
  try {
    await connectDB();
    await ensureCatalogIndexes();
    await ensureUserIndexes();
    await siteService.ensureDefaultSites();

    const server = app.listen(env.PORT, () => {
      console.log(`Buytly API running on port ${env.PORT} [${env.NODE_ENV}]`);
      if (isSwaggerEnabled) {
        console.log(`Swagger docs: ${publicBaseUrl}/api/docs`);
      }
    });

    const shutdown = async (signal) => {
      console.log(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
