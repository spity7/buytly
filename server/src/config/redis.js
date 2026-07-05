import Redis from "ioredis";
import { env } from "./env.js";

let redis = null;

export const connectRedis = async () => {
  if (!env.REDIS_URL) {
    console.log("Redis not configured — caching disabled");
    return null;
  }

  redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

  await redis.connect();
  console.log("Redis connected");
  return redis;
};

export const getRedis = () => redis;

export const disconnectRedis = async () => {
  if (redis) {
    await redis.quit();
    redis = null;
    console.log("Redis disconnected");
  }
};

export const isRedisConnected = () => redis?.status === "ready";

/** Health-check status: not_configured | connected | disconnected */
export const getRedisStatus = () => {
  if (!env.REDIS_URL) return "not_configured";
  return isRedisConnected() ? "connected" : "disconnected";
};
