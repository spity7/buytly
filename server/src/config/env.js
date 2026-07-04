import dotenv from "dotenv";
import { z } from "zod";

// Test env is set in tests/setup.js — do not load .env
if (process.env.NODE_ENV !== "test") {
  dotenv.config();
}

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  GCS_PROJECT_ID: z.string().min(1),
  GCS_BUCKET: z.string().min(1),
  GCS_KEY_FILE: z.string().optional(),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
  SMTP_FROM: z.string().email(),
  REDIS_URL: z.string().optional(),
  APP_URL: z.string().url().default("http://localhost:3000"),
  /** Public API base URL (e.g. https://api.buytly.com/api/v1) — used by Swagger in production */
  API_URL: z.string().url().optional(),
  /** Set to true when behind nginx/Cloud Load Balancer (required for rate limits & HTTPS) */
  TRUST_PROXY: z
    .string()
    .optional()
    .default("false")
    .transform((v) => v === "true" || v === "1"),
  /** Expose /api/docs — defaults to on in development, off in production */
  SWAGGER_ENABLED: z
    .string()
    .optional()
    .transform((v) =>
      v === undefined ? undefined : v === "true" || v === "1",
    ),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  process.exit(1);
}

export const env = parsed.data;

export const isSwaggerEnabled =
  env.SWAGGER_ENABLED ?? env.NODE_ENV !== "production";
