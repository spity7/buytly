import { afterAll, afterEach } from "vitest";
import mongoose from "mongoose";

// Set before any src/ import (env.js skips dotenv when NODE_ENV=test)
process.env.NODE_ENV = "test";
process.env.PORT = "5099";
process.env.TRUST_PROXY = "false";
process.env.MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/buytly-test";
process.env.APP_URL = "http://localhost:3000";
process.env.CORS_ORIGIN = "http://localhost:3000";
process.env.REDIS_URL = "";

process.env.JWT_ACCESS_SECRET = "test-access-secret-minimum-32-chars!!";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-minimum-32-chars!";
process.env.JWT_ACCESS_EXPIRES_IN = "15m";
process.env.JWT_REFRESH_EXPIRES_IN = "7d";

process.env.GCS_PROJECT_ID = "test-project";
process.env.GCS_BUCKET = "test-bucket";

process.env.SMTP_HOST = "smtp.test.com";
process.env.SMTP_PORT = "587";
process.env.SMTP_USER = "test@test.com";
process.env.SMTP_PASS = "password";
process.env.SMTP_FROM = "noreply@test.com";

export let mongoAvailable = false;

try {
  const { connectDB } = await import("../src/config/db.js");
  await connectDB();
  mongoAvailable = true;
} catch {
  console.warn(
    "MongoDB not available — integration tests will be skipped. Start MongoDB or set MONGODB_URI.",
  );
}

afterEach(async () => {
  if (!mongoAvailable) return;
  const collections = mongoose.connection.collections;
  for (const collection of Object.values(collections)) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (!mongoAvailable) return;
  const { disconnectDB } = await import("../src/config/db.js");
  await disconnectDB();
});
