import crypto from "crypto";
import { getRedis } from "../config/redis.js";

const DEFAULT_TTL = 300;

export const cacheService = {
  isEnabled() {
    const redis = getRedis();
    return redis?.status === "ready";
  },

  buildKey(prefix, params) {
    const hash = crypto
      .createHash("md5")
      .update(JSON.stringify(params))
      .digest("hex");
    return `${prefix}:${hash}`;
  },

  async get(key) {
    const redis = getRedis();
    if (!redis || redis.status !== "ready") return null;

    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },

  async set(key, value, ttl = DEFAULT_TTL) {
    const redis = getRedis();
    if (!redis || redis.status !== "ready") return;

    await redis.setex(key, ttl, JSON.stringify(value));
  },

  async delPattern(pattern) {
    const redis = getRedis();
    if (!redis || redis.status !== "ready") return;

    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },

  async invalidateProperties() {
    await this.delPattern("properties:*");
  },

  async invalidateAnalytics() {
    await this.delPattern("analytics:*");
  },
};
