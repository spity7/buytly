import app from "./app.js";
import { env, isSwaggerEnabled } from "./config/env.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { connectRedis, disconnectRedis } from "./config/redis.js";

const publicBaseUrl = env.API_URL.replace(/\/api\/v1\/?$/, "");

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();

    const server = app.listen(env.PORT, () => {
      console.log(`Buytly API running on port ${env.PORT} [${env.NODE_ENV}]`);
      if (isSwaggerEnabled) {
        console.log(`Swagger docs: ${publicBaseUrl}/api/docs`);
      }
    });

    const shutdown = async (signal) => {
      console.log(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectRedis();
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
