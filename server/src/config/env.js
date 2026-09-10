import dotenv from "dotenv";
import { z } from "zod";

// Test env is set in tests/setup.js — do not load .env
if (process.env.NODE_ENV !== "test") {
  dotenv.config();
}

const envSchema = z
  .object({
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
    EMAIL_PROVIDER: z.enum(["smtp", "sendgrid"]).default("smtp"),
    SENDGRID_API_KEY: z.string().optional(),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM: z.string().email(),
    REDIS_URL: z.string().optional(),
    APP_URL: z.string().url().default("http://localhost:3000"),
    /** Public API base URL (e.g. https://api.buytly.com/api/v1) — Swagger servers + startup logs */
    API_URL: z.string().url(),
    /** Set to true when behind nginx/Cloud Load Balancer (required for rate limits & HTTPS) */
    TRUST_PROXY: z
      .string()
      .optional()
      .default("false")
      .transform((v) => v === "true" || v === "1"),
    /** Google OAuth Web client ID — used to verify GIS ID tokens */
    GOOGLE_CLIENT_ID: z.string().min(1),
    /** Expose /api/docs — defaults to on in development, off in production */
    SWAGGER_ENABLED: z
      .string()
      .optional()
      .transform((v) =>
        v === undefined ? undefined : v === "true" || v === "1",
      ),
  })
  .superRefine((data, ctx) => {
    if (data.EMAIL_PROVIDER === "sendgrid") {
      if (!data.SENDGRID_API_KEY?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "SENDGRID_API_KEY is required when EMAIL_PROVIDER=sendgrid",
          path: ["SENDGRID_API_KEY"],
        });
      }
      return;
    }

    const smtpFields = [
      ["SMTP_HOST", data.SMTP_HOST],
      ["SMTP_USER", data.SMTP_USER],
      ["SMTP_PASS", data.SMTP_PASS],
    ];

    for (const [field, value] of smtpFields) {
      if (!value?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${field} is required when EMAIL_PROVIDER=smtp`,
          path: [field],
        });
      }
    }
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
