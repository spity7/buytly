import rateLimit from "express-rate-limit";

const isTestEnv = process.env.NODE_ENV === "test";

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTestEnv ? 10_000 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTestEnv ? 10_000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later",
  },
});
